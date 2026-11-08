# Trellis Sprint 1 Closeout

Recorded 8 November 2026. The agreed authentication and Instagram connection workflow is working. This milestone covers the implemented development flow. Outstanding full-product requirements remain in BACKLOG.md.

## Delivered

- Registration with bcrypt password hashes, duplicate-email feedback, sign-in, SQLite-backed SCS sessions, and logout.
- Instagram Unified Login with session-bound state and expiry, code exchange, real account discovery, and account identity display.
- SQLite connection storage with an AES-GCM encrypted token. The key is a persistent 32-byte value loaded from configuration.
- Steps 1–3 lead through connection, account identity display, and entry to the dashboard.
- Returning users with a saved connection navigate directly to the dashboard. A missing connection routes to Step 1. Other lookup failures produce visible feedback.
- The dashboard retrieves the live follower count and offers reconnection on profile-loading errors. Successful reconnection returns to the dashboard.
- Webhook challenge verification and signed request validation. Received events are acknowledged and counted in logs.
- Backend directory renamed from go-sqlite to Backend, with a separate key-generator command under Backend/cmd.

## Validation and limits

The user reported the restored dashboard and reconnect flow working on 8 November. Earlier live responses established the real account identity and follower count. Go tests cover session lifecycle, webhook validation, and local environment loading. Frontend tests cover successful login routing, missing connections, failed credentials, and lookup failures. The Angular development build passed after reconnect UI changes.

The closeout run on 8 November passed `go test ./...` and all 31 frontend tests across 14 files. The initial sandboxed frontend run could not access temporary test files. The unrestricted rerun passed without code changes. Credential-pattern review found no matching credentials in source/document text, and Git ignores the local configuration files and SQLite databases.

The restart/logout acceptance sequence was requested, but a separately recorded result for every step is absent. Repeat and record the complete walkthrough during Sprint 2 integration review. The current suite does not establish every OAuth failure path, concurrent callback behavior, or cross-user connection constraint. Track those in the backlog.

## Run locally

From the repository root, use separate terminals.

```powershell
cd Backend
go run .
```

```powershell
cd Frontend
npm start
```

Start the existing ngrok tunnel to the Angular development server on port 4200. Angular proxies API requests to Go on 127.0.0.1:8080. The registered Meta callback currently uses the configured ngrok host and /auth/instagram/callback. Update the callback configuration and allowed hosts together if the host changes.

The ngrok traffic policy in tp.yml currently limits browser access to the developer's Google identity. This is a development restriction and needs review before an independent user's trial. The webhook path is exempt from interactive authentication so Meta can reach it.

## Local configuration

Backend startup reads Backend/.env.instagram.local and the repository-root .env.token-key.local when run from Backend. Existing process environment variables take precedence, including values inherited from an older terminal. Use a fresh terminal or remove an outdated environment variable if a file change appears ineffective.

Backend/.env.instagram.local contains the following names with actual local values.

```dotenv
META_APP_SECRET=your_local_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_local_verification_value
```

The root .env.token-key.local contains TOKEN_ENCRYPTION_KEY with exactly 64 hexadecimal characters representing 32 bytes. The loader accepts unquoted values and matching single or double quotes. Go validates the decoded key length. Startup requires the app secret and a valid encryption key. Webhook verification requires its configured verification value.

Generate a key once from Backend using `go run ./cmd`, save it locally, and reuse it on subsequent starts. Each encryption still generates a fresh nonce. Keep the key available separately from the database when backing up local data. Environment files and SQLite databases are ignored by Git.

The loader supports NAME=value lines, blank lines, full-line comments, and matching surrounding quotes. It does not implement shell expansion or inline-comment parsing.

## Encryption change and recovery

An earlier token was encrypted with the tutorial key. Replacing that key caused /auth/instagram/profile to report Unable to decrypt Instagram token. Reconnecting Instagram overwrites the existing account's token using the active key. The recent missing OAuth configuration error came from starting without the app secret. Automatic loading addresses that startup problem.

Changing a key does not re-encrypt existing database values. For future deliberate rotation, decrypt with the old key and re-encrypt with the new key, or obtain fresh authorization. Preserve the old key until any migration is verified. Lost keys cannot decrypt existing ciphertext.

## Current route behavior

| Route | Behavior |
|---|---|
| POST /signin, POST /signup, POST /logout, GET /me | Trellis identity and session lifecycle |
| GET /auth/instagram/start | Starts initial setup authorization |
| GET /auth/instagram/start?return_to=/dashboard | Starts reconnection and saves the allowed dashboard destination in the session |
| GET /auth/instagram/callback | Validates state, exchanges code, discovers identity, saves encrypted connection, and redirects |
| GET /auth/instagram/connection | Returns saved account ID and username for the signed-in user |
| GET /auth/instagram/profile | Decrypts the saved token server-side and retrieves current follower count |
| GET and POST /webhooks/instagram | Challenge verification and signed-event receipt |

The callback currently saves the link before Step 2's Continue action. The database prevents assigning the same Instagram ID to a different user, but does not enforce one Instagram account per Trellis user. These differences from AUTH-02/03 are recorded as open work.

## Carryover

Documentation/BACKLOG.md is the working carryover register. INSTAGRAM-ISSUE.md retains the full historical discovery investigation. The cause of the original empty account list remains unproven, and webhook test delivery alone does not establish downstream event processing.
