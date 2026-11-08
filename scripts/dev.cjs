// Run with `node scripts/dev.cjs`, or use the VS Code launch configuration.
const { spawn, spawnSync } = require('node:child_process');
const { createServer } = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const children = new Set();
let stopping = false;

function stopChildren() {
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32') {
      // Include go run's compiled child so a restart releases port 8080.
      spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch (error) {
        if (error.code !== 'ESRCH') console.error(error.message);
      }
    }
  }
  children.clear();
}

function stop(code) {
  if (stopping) return;
  stopping = true;
  stopChildren();
  process.exit(code);
}

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      if (host === '::1' && ['EADDRNOTAVAIL', 'EAFNOSUPPORT'].includes(error.code)) {
        resolve();
        return;
      }
      reject(new Error(`Port ${port} is unavailable. Stop the existing Trellis server, then start again.`));
    });
    server.listen(port, host, () => server.close(resolve));
  });
}

function start(name, command, args, cwd) {
  console.log(`[Trellis] Starting ${name}`);
  // Child services should not inherit this launcher's Node debugger injection.
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  delete env.VSCODE_INSPECTOR_OPTIONS;
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    windowsHide: true,
    detached: process.platform !== 'win32',
  });
  children.add(child);
  child.once('error', (error) => {
    console.error(`[Trellis] Could not start ${name}: ${error.message}`);
    stop(1);
  });
  child.once('exit', (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`[Trellis] ${name} exited (${signal || code}). Stopping the other services.`);
      stop(code || 1);
    }
  });
}

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
process.once('exit', stopChildren);

async function main() {
  await Promise.all([checkPort(4200), checkPort(4200, '::1'), checkPort(8080)]);
  start('Go', 'go', ['run', '.'], path.join(root, 'Backend'));
  start('Angular', process.execPath, [
    path.join(root, 'Frontend/node_modules/@angular/cli/bin/ng.js'), 'serve',
  ], path.join(root, 'Frontend'));
  start('ngrok', 'ngrok', [
    'http', '4200',
    '--url', 'https://lunar-disown-heaving.ngrok-free.dev',
    '--traffic-policy-file', path.join(root, 'tp.yml'),
    '--log', 'stdout',
  ], root);
  console.log('[Trellis] Angular rebuilds on save. Use the VS Code Restart button after Go changes.');
}

main().catch((error) => {
  console.error(`[Trellis] ${error.message}`);
  stop(1);
});
