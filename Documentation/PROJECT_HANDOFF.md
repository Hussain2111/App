# Trellis Project Handoff

Updated 8 November 2026, Asia/Riyadh. This is the durable working context distilled from the development conversation through Sprint 1 closeout and Sprint 2 planning. Routine tutorials, repeated checks, and superseded debugging steps have been condensed. Historical findings with unresolved causes are preserved explicitly.

## Resume here

Sprint 1's development connection flow works, and the user has confirmed the latest reconnection repair. Sprint 2 is planned but has not started implementation. Its scope is Overview, Analytics, and Profile Audit. Sprint 2B will improve performance, refresh, recovery, and loading after the dashboard is implemented. Content Planner has its own later sprint.

The next concrete task is S2-01 in the Sprint 2 plan. Map each existing dashboard card, chart, filter, and audit section to its required fields and calculations. Retrieve current official Meta documentation and verify actual account capabilities before choosing the data contracts. Record availability, reporting periods, permission requirements, coverage, and unresolved questions. Begin with the working Unified Login integration.

Before editing, inspect the current repository status and relevant files. This handoff describes a dated state and can become stale as the user develops the project.

## Reading order

1. [Documentation guide](README.md) for the active documents and their authority.
2. [Sprint 1 closeout](Trellis_Sprint_1_Closeout.md) for implemented behavior, startup instructions, configuration, and verification limits.
3. [Sprint 2 plan](Trellis_Sprint_2_Plan_v0_1.md) for the agreed scope and proposed task breakdown.
4. [Working backlog](BACKLOG.md) for carryover and remaining product work.
5. [Release roadmap](Trellis_Product_Roadmap_v0_1.md), particularly Section 9, for the current December forecast.
6. [BRD](Trellis_BRD_v1_1.md) and [SRS](Trellis_SRS_v1_1.md) when defining detailed acceptance criteria.
7. [Instagram investigation](../INSTAGRAM-ISSUE.md) only when the original account-discovery issue becomes relevant.

## Product and delivery context

Trellis is an Instagram analysis, growth guidance, and content-planning web application, initially for a skincare/K-beauty creator. The broader product includes account analytics, profile audit, grounded AI Chat, image-led editable content generation, a planner, competitor analysis, combined topic/idea discovery, and official Instagram/Edits updates.

The intended application is iPad-first with usable mobile and desktop flows. Actual data, source timestamps, and coverage matter. Missing information must remain distinguishable from zero. Suggestions should explain their evidence and uncertainty. Publishing requires explicit user approval of the particular content. Free-tier costs and permitted data access constrain future provider choices.

The target date is 31 December 2026. The existing roadmap defines an integrated MVP checkpoint with visible maturity labels and a retained future backlog. Completing the full BRD/SRS is still high risk. As of November 8, 53 days remain. The earlier 10–20 hours/week assumption has not been reconfirmed, and no measured velocity supports a completion percentage.

## How Hussain prefers to work

- Hussain is learning while implementing. Prefer straightforward changes with an explanation of what each part does and why it belongs there.
- Requests such as “check it” ordinarily call for reading the current files and explaining the remaining issues. Requests such as “do the rest” authorize implementation within that discussed scope.
- Several earlier tasks explicitly required tutorials or remaining code blocks while Hussain did the implementation. Follow the latest request rather than assuming every task should be coded automatically.
- Keep changes proportionate. Extra abstractions, diagnostic files, and tests that mirror implementation make learning harder. Add targeted checks where they establish important behavior.
- Give specific tutorials and exact official links for the actual use case. General documentation landing pages alone have been insufficient.
- Retrieve documentation proactively. If an automated fetch fails and computer use is authorized, inspect it through the available browser. Report any access limitation accurately.
- Analyze syntax, semantics, documented requirements, observed behavior, and unknowns before proposing more tests. Avoid repeated unexplained trial-and-error.
- Do not label a root cause proven because the behavior changed. Retain failed and successful evidence, configuration differences, and uncertainty.
- Preserve the existing architecture when external access fails. The Instagram sprint explicitly required the same Meta app, separate client business portfolio, Unified Login, and no Apify.
- Use filesystem tools for source editing. Computer use is useful for authenticated Meta pages, not a prerequisite to edit local files.
- Keep a backlog for unfinished details and commit coherent milestones. Respect any instruction to commit only while the user implements the next tasks.

These preferences summarize the conversation and can be changed by the user's next explicit instruction.

## Repository and implementation map

| Item | Location or behavior |
|---|---|
| Repository | C:/Users/Hussain/Documents/Projects/Trellis |
| GitHub | https://github.com/Hussain2111/App.git |
| Current branch at handoff | main |
| Frontend | Frontend/, Angular and TypeScript |
| Backend | Backend/, Go net/http and SQLite. Former directory go-sqlite was renamed |
| Main server and routes | Backend/main.go |
| OAuth, encryption, connection and profile handlers | Backend/oauth.go |
| Users and connection schema | Backend/users.go |
| SCS persistence | Backend/session.go |
| Webhook challenge and signed receipt | Backend/webhooks.go |
| One-time encryption-key generator | Backend/cmd/main.go, run with go run ./cmd from Backend |
| Angular authentication | Frontend/src/app/authentication.ts and sign-in/sign-in.ts |
| Dashboard | Frontend/src/app/workspace/dashboard.ts and dashboard.html |
| Initial setup | Frontend/src/app/connect/step1, step2, step3 |
| Development API proxy | Frontend/src/proxy.conf.json |
| ngrok traffic policy | tp.yml |

The current stack is Angular, Go, SQLite, SCS, bcrypt, AES-GCM, and Instagram Unified Login. Older architecture proposals mention PostgreSQL and durable jobs. Those proposals do not require a migration for Sprint 2.

## Working user flows

### Trellis sign-in and initial connection

Registration saves a bcrypt password hash. Successful sign-in creates or renews the Trellis session and updates frontend user state. The frontend then requests the saved Instagram connection. A successful response routes to /dashboard. A connection 404 routes to /step1. Other errors display form feedback.

Step 1 opens /auth/instagram/start. Go validates the Trellis session, creates random OAuth state and an expiry, saves them in SCS, and redirects to Meta. The callback validates the session, state, expiry, and authorization code. It exchanges the code, discovers the authorized Instagram identity, encrypts the token, and upserts the connection. Initial setup proceeds to /step2, which displays the real username and ID, then Step 3 and the dashboard.

Current implementation detail requiring follow-up is that the connection is saved before Step 2's explicit confirmation. The full SRS requires confirmation before completing the link. AUTH-03-GAP records this.

### Returning users and reconnection

The Instagram connection and encrypted provider token live in SQLite and survive Trellis logout. The Trellis session identifies which user's connection to retrieve. A user should normally authorize Instagram during initial setup and keep that connection across visits.

The dashboard fetches /auth/instagram/profile for the live follower count. On a profile-loading error it offers Reconnect Instagram, except that a missing connection offers initial setup. Reconnect uses /auth/instagram/start?return_to=/dashboard. The allowed dashboard destination is stored with the OAuth attempt in the session. Successful reconnection returns to /dashboard. No arbitrary return URL is accepted.

The current button appears for general profile errors as well as credential failures. More precise recovery classification belongs to Sprint 2B. Provider expiry/revocation can require reauthorization even with correct persistent storage.

## Configuration and data durability

Run Go from Backend with `go run .`. Startup loads Backend/.env.instagram.local and ../.env.token-key.local. Existing environment variables take precedence. The first file supplies META_APP_SECRET and the webhook verification value. The second supplies TOKEN_ENCRYPTION_KEY as 64 hex characters decoded to 32 bytes. The loader supports quoted or unquoted values, blank lines, and full-line comments.

Generate the encryption key once and keep it consistent across restarts. Encryption uses a fresh nonce for each token. The stored BLOB combines the nonce, ciphertext, and authentication tag. Changing the key does not migrate earlier ciphertext. Preserve the correct key with a separate secure backup if preserving the database.

The database path is relative to Backend's working directory. Starting from an unexpected directory can open a different users.db. Local environment files and databases are ignored by Git. A repository backup alone cannot restore those private local values.

No raw access token, secret, password, encryption key, cookie, or authorization code should be added to this handoff or other project documents. Some credentials were shared during the development conversation. Rotation confirmation remains a backlog task. The full startup and recovery procedures are in the Sprint 1 closeout.

## Meta integration facts and evidence limits

- The implementation uses Instagram API with Unified Login, a Facebook authorization endpoint with a configuration ID, and a Graph API code-exchange endpoint. Retrieve the current official documentation before changing this flow.
- The existing app and the creator's business portfolio remain separate. Transferring the creator's Instagram account into the developer's portfolio was not adopted as a fix.
- The successful callback token was reported as SYSTEM_USER, valid for Trellis, with Instagram permissions. The configuration reported no expiry. Treat that as the observed token metadata and continue handling revoked or invalid access.
- Successful discovery returned the real account glowithuzma. IDs and the historical requests are in INSTAGRAM-ISSUE.md. Application logic must continue deriving the identity from the authenticated connection.
- Graph API Explorer's “not you” warning concerned the token identity compared with the developer logged into Explorer. It did not establish token invalidity.
- PKCE support for this specific configuration was not verified. The implementation relies on its existing state/code flow, and IG-PKCE retains the documentation follow-up.
- Webhook delivery is verified and acknowledged. Business event processing is unfinished. Successful webhook delivery and account discovery are separate observations, with no proven causal explanation for the earlier discovery failure.

## Important incidents to preserve

| Incident | Established conclusion | Remaining uncertainty or follow-up |
|---|---|---|
| Frontend expected JSON but received HTML beginning with DOCTYPE | API routing/proxy configuration needed attention. Verify that a backend route reaches Go before treating it as a JSON decoding issue | Keep new API paths covered by the proxy and restart ng serve when proxy configuration changes |
| SCS could not encode time.Time | The OAuth expiry was changed to an int64 Unix timestamp | Avoid reintroducing unsupported session values without codec support |
| Meta token exchange failed | The working exchange includes the same redirect_uri used for authorization | The original complete upstream error was not retained, so its subcode alone does not prove the full diagnosis |
| Empty assigned Instagram accounts and error 100/33 | Later backend and Explorer requests both returned the account. Restoring the earlier OAuth implementation also succeeded | Root cause unproven. IG-001 remains deferred. Later diagnostic rewrites were not established as necessary fixes |
| Overstrict diagnostic business identity check | It incorrectly required an id field when the request selected client_business_id. Making that extra field optional allowed investigation to continue | This diagnostic fix did not itself resolve the later empty discovery response |
| Webhook verification failed through ngrok | The webhook path needed exemption from interactive Google authentication and email filtering | Current traffic policy still restricts ordinary browser access to the developer |
| Saved token failed decryption | The encryption key changed after the token had been saved. Fresh authorization replaced the encrypted token under the active key | Deliberate future key rotation requires migration or reauthorization |
| OAuth was “not configured” after restart | META_APP_SECRET was absent from the server environment. Local file loading was added | Inherited stale environment values override file changes |
| Sign-in profile lookup never executed | An un-subscribed inner observable was replaced by login → switchMap(fetchProfile) → subscribe | Only connection 404 becomes a missing-connection result. Other errors stay errors |

The extended chronology, comparison experiments, and limits of the discovery investigation are preserved in INSTAGRAM-ISSUE.md. Avoid restarting that investigation without a new failure or an explicit user request.

## Verification state at closeout

- Go tests passed at the November 8 closeout.
- All 31 Angular tests across 14 files passed. A sandboxed attempt initially failed to read temporary files, then an unrestricted rerun passed without code changes.
- The Angular development build passed after the reconnect changes.
- The user confirmed the repaired live flow works. Real identity and follower responses were supplied during development.
- A separately recorded result for every logout/login/restart acceptance step is absent. Further ownership, concurrent callback, and full OAuth failure-path verification remains in BACKLOG.md.

Run relevant checks when implementation changes. An automated test using simulated Meta responses cannot independently prove live provider access.

## Sprint and deadline decisions

Sprint 2 is scoped to the three dashboard tabs. Its first task establishes available data, metric definitions, and coverage. Storage, Overview, Analytics, and Audit follow. A rule-based audit is the proposed first approach. API history, audience fields, and engagement definitions remain to be verified.

Sprint 2 includes basic usable loading, error, and empty states. Sprint 2B concentrates on performance, refresh policy, saved-data reuse, partial recovery, and loading improvements informed by the completed dashboard. Planner work is explicitly separated.

Dates of November 8–14 for Sprint 2 and later windows in the roadmap are proposed. The original longer-term product requirements remain in the BRD/SRS. A missing separate 66-story backlog means a complete story-by-story progress percentage is unavailable. Reforecast after Sprint 2 using actual hours and accepted results.

## Git and documentation history

| Commit | Meaning |
|---|---|
| 4f727a1 | Instagram OAuth discovery and webhook support |
| 8ffccf5 | Persisted connections and live follower-count dashboard |
| 2625e66 | Sprint 1 closeout, backend directory rename, returning-user routing, persistent key configuration, reconnect flow, and documentation snapshot |
| f88d0d8 | Documentation consolidation and December forecast |

These commits were pushed to origin/main. The repository was clean at f88d0d8 before this handoff was added. Check Git for later updates.

Older BRD v1.0, SRS v1.0, and Architecture v0.1 were preserved in 2625e66 before removal from the working folder. Their current successors remain active. Two historical reviews and Sprint 0 are in Documentation/Archive. Wireframes and the original product-owner summary were retained because they provide distinct source/design context.

## Updating and using this handoff

After a milestone, update the current state, next action, verification date, and important decisions here. Keep detailed tasks in BACKLOG.md, sprint acceptance in the sprint document, and long incident evidence in its issue record. Never copy local secrets into Git to make a handoff self-contained.

For a new chat, use the following prompt.

> Open C:/Users/Hussain/Documents/Projects/Trellis. Read Documentation/PROJECT_HANDOFF.md and the linked Sprint 2 plan, closeout, and backlog. Inspect current Git status before editing. Resume with S2-01 capability and dashboard-data mapping. Retrieve current official Meta documentation and preserve the existing Unified Login, Go, SQLite, and Angular architecture. Explain the next implementation step clearly, and follow my current instructions about whether I want a review, tutorial, or code changes.

This handoff is a curated record of useful project knowledge. A verbatim conversation export, if desired, is a separate artifact. It does not contain the private local configuration or database required to restore a running environment.
