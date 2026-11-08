# Trellis VS Code Setup

Configured 8 November 2026 for opening the Trellis repository root in VS Code.

## Start and restart the application

Open Run and Debug with Ctrl+Shift+D. Select **Trellis: start everything** and press F5. The floating debug toolbar supplies Restart and Stop. Restart rebuilds Go and restarts Angular and ngrok. Angular also rebuilds automatically when frontend files are saved.

Stop any servers you previously started manually before the first launch. The launcher checks the frontend and backend ports and reports a conflict without terminating existing processes.

The equivalent single command from the repository root is the following.

```powershell
node scripts/dev.cjs
```

Ctrl+C stops the processes started by that command. VS Code's Restart button is available when using F5. The launcher runs Go from Backend, Angular from Frontend, and ngrok with the existing public domain and tp.yml policy. It uses the existing local configuration files and ngrok credentials. It generates no new encryption key.

`scripts/dev.cjs` is a small process launcher so the debug toolbar can manage all three services together. On Windows, cleanup uses the tracked child process IDs and their descendants, including the compiled process created by go run. A service exiting stops the other services started by this launcher. A live tunnel can take time to become available after restart.

The default launch controls service processes. For Go source breakpoints, use the separate **Trellis: Go breakpoints (requires Delve)** configuration. Stop the all-services launch first to release port 8080. The Go extension may ask to install Delve. Start Angular and ngrok separately when using that breakpoint configuration.

## Formatting and learning aids

The workspace enables Prettier for TypeScript, JavaScript, Angular HTML, CSS, and JSON. Go formatting uses the installed Go extension and gopls. Formatting runs on explicit save and on supported paste operations. Auto-save uses focus changes so saving and formatting work together. Frontend/.prettierrc remains the project's formatting convention.

Paired brackets and quotes are inserted as you type. Bracket guides highlight the current pair. Prettier formats parseable code and adds semicolons according to its configuration. It cannot reliably repair missing braces or infer the intended behavior of a broken pasted block.

Automatic suggestion popups, inline completion text, next-edit suggestions, and snippet suggestions are disabled. Hover documentation and parameter hints remain enabled. Ctrl+Shift+Space requests parameter information, F12 opens a definition, and F8 moves to the next error. Ctrl+Space can request completions explicitly if desired.

The installed Go and Angular Language Service extensions provide signatures and diagnostics. Error Lens can additionally display errors and warnings beside the affected line once installed. These diagnostics still use compiler terminology.

For a plain-language explanation, select the relevant code and run **Codex: Add to Codex Chat** from Ctrl+Shift+P. Then ask one of the following.

> Explain this method using my selected code. Describe each parameter, the return value, and what happens when it runs. Define unfamiliar terms and give one small example. Keep the explanation focused on this selection.

> Check the selected block for syntax and semantic errors. Show the smallest correction and explain each change. Let me apply the correction myself.

Codex supplies on-demand explanations and corrections through its chat panel. Selection-based context is supported by the installed extension. It does not automatically rewrite hover documentation into simpler language. [Official Codex commands](https://developers.openai.com/codex/ide/commands)

## Extensions and theme

Already installed at inspection time were Go, Angular Language Service, Prettier, Codex, and SQLite by alexcvzz. Workspace recommendations include those tools plus Catppuccin and Error Lens.

The attempted installs of Catppuccin and Error Lens were blocked by this agent environment's marketplace DNS and filesystem permissions. Complete these two installs in your normal VS Code terminal, or use Extensions → search **@recommended**.

```powershell
code --install-extension Catppuccin.catppuccin-vsc
code --install-extension usernamehw.errorlens
```

The workspace selects **Catppuccin Mocha**, the dark variant. It becomes available after the theme extension is installed. Error Lens displays existing diagnostics inline. [Catppuccin](https://github.com/catppuccin/vscode), [Error Lens](https://github.com/usernamehw/vscode-error-lens)

The standalone GitHub.copilot extension was absent. GitHub.copilot-chat is built into this VS Code installation, and its CLI refused uninstallation. Workspace settings disable the built-in AI features and Copilot suggestions. Codex remains separately installed. To apply the same Copilot setting across other projects, enable **Chat: Disable AI Features** in User settings. [VS Code AI settings](https://code.visualstudio.com/docs/agents/reference/ai-settings)

## Terminal symbols

The machine already has JetBrains Mono Nerd Font installed. The workspace now selects that font for the integrated terminal. Open a new terminal after settings load. Font rendering should restore the prompt's icon glyphs while retaining the existing PowerShell profile. [VS Code terminal fonts](https://code.visualstudio.com/docs/terminal/appearance)

## SQLite tables

Use Ctrl+Shift+P → **SQLite: Open Database** and select Backend/users.db. Expand the database in SQLite Explorer, then right-click a table and select **Show Table**. Use **SQLite: Refresh Databases** after schema changes.

The current tables include users, sessions, and instagram_connections. For a focused connection query that avoids displaying credential columns, use **SQLite: New Query** and run the following.

```sql
SELECT user_id, instagram_id, username, business_id
FROM instagram_connections;
```

The installed SQLite extension includes a Windows sqlite executable. Its direct execution failed with a DLL relocation error inside the agent sandbox, so table rendering in the normal VS Code host remains to be checked. The extension commands and bundled executable were verified as present. [SQLite extension](https://github.com/AlexCovizzi/vscode-sqlite)

## Explorer organization

The workspace hides .angular, .vscode, node_modules, dist, coverage, generated debug binaries, and executable output from Explorer.

| Area | Explorer grouping |
|---|---|
| Root | README.md contains .gitignore, tp.yml, INSTAGRAM-ISSUE.md, and any root environment files |
| Frontend | package.json contains the lockfile, Angular/TypeScript configuration, and formatting configuration |
| Backend | go.mod contains go.sum and local environment files |
| Go sources | Each source file contains its matching test file. main.go also contains config_test.go because configuration loading lives there |
| TypeScript sources | Each source file contains its matching spec.ts file |
| SQLite | Each database contains its journal, WAL, and shared-memory sidecar files |

These are Explorer display rules. Database files remain visible for SQLite inspection. The grouping follows the actual folders and does not require moving Go package files or changing imports.

The app.routes.ts file remains visible under Frontend/src/app. Use Ctrl+P and type app.routes.ts to open it directly. Configuration files remain in use. Expand package.json to access the grouped Angular files. Use **Preferences: Open Workspace Settings (JSON)** to change hiding rules or open the workspace configuration despite .vscode being hidden.

## Verification status

JSON configurations and the launch script were syntax-checked. A simulated process-lifecycle check passed for service commands, working directories, stopping owned process trees, and cleanup after service failure. A startup attempt invoked the three services, but the sandbox could not reach ngrok and did not expose its normal user configuration. The attempt was stopped. Full F5 launch/restart, theme rendering, terminal glyph rendering, and SQLite table display require a check in the normal VS Code host. Existing application source files were not changed by this setup.

After installing the two recommended additions, reload VS Code, open a fresh terminal, and start the application with F5. Check that a restart releases ports and the public domain becomes available again.
