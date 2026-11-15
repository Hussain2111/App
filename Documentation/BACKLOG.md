# Trellis Working Backlog

Updated 14 November 2026. This register records implementation gaps and sprint allocations. The BRD and SRS retain the complete product requirements. Status is open unless stated otherwise. Priorities identify proposed order, subject to user planning.

## Sprint 1 carryover

| ID | Work and completion condition | Priority | Destination |
|---|---|---|---|
| IG-001 | Establish the cause of the original empty Instagram discovery response using comparable request/token evidence. Investigation is in ../INSTAGRAM-ISSUE.md | Deferred | Investigation backlog |
| IG-002 | Finish setup-page previews, demo copy, responsive layout, loading/error content, and button spacing across Steps 1–3 | P2 | UI cleanup |
| AUTH-02-GAP | Enforce one connected Instagram account per Trellis user, define replacement behavior, and migrate any duplicate user connections safely | P1 | Before multi-user acceptance |
| AUTH-03-GAP | Save a pending authorization until explicit identity confirmation, or obtain a documented product decision on the current save-before-confirm flow | P1 | Connection completion |
| AUTH-05-07-GAP | Implement disconnect/replacement, explicit retention choice, and separate account deletion with clear data effects | P1 | Account lifecycle sprint |
| AUTH-VERIFY | Verify cross-user reads/writes, link replacement, OAuth error/state expiry/replay, and the complete logout/login/backend-restart sequence. Record live and automated evidence separately | P1 | Sprint 2 integration review |
| IG-PERSISTENCE | Investigate the reported need to reconnect Instagram after browser closure or session expiry. The saved account must remain linked to the same Trellis login across new sessions, logout/login, and backend restart. Distinguish a missing Trellis session, missing connection, token/decryption failure, and temporary Meta failure before offering reauthorization. See investigation below. | P1 | Authentication / dashboard recovery |
| AUTH-CONCURRENCY | Review single-use OAuth state under concurrent callbacks and simultaneous start requests. Add a targeted regression check if the current session approach permits replay | P1 | Authentication hardening |
| KEY-LIFECYCLE | Define backed-up key recovery and deliberate key rotation for existing encrypted records. Confirm previously shared development credentials have been rotated | P1 | Before sharing beyond local development |
| WEBHOOK-EVENTS | Process and persist useful signed events with duplicate-delivery handling when a product feature consumes them. Current handler validates and acknowledges only | P2 | Relevant data/event sprint |
| DEV-ACCESS | Review the ngrok developer-only email restriction and test creator access. Record production cookie, HTTPS, CSRF, request-size and login-abuse controls before any hosted release | P1 | Creator trial / deployment readiness |
| IG-PKCE | Recheck official support for PKCE in this configured Meta flow and document a supported implementation decision | Deferred | OAuth review |
| UI-DEVICE | Verify initial setup, sign-in, and dashboard on the target iPad in both orientations and on mobile/desktop | P1 | Sprint 2 integration review |

## Dashboard allocation

| ID | Work | Destination |
|---|---|---|
| DASH-DATA | Verify profile/media/insights fields, permission coverage, periods, and metric definitions | Sprint 2 S2-01 |
| DASH-STORAGE | Persist owned observations with source timestamps, safe retries, and accurate missing-data semantics | Sprint 2 S2-02 |
| DASH-OVERVIEW | Populate profile, verified metrics, recent media, and evidence-backed opportunity | Sprint 2 S2-03 |
| DASH-ANALYTICS | Implement supported date filters, trends, follower changes, ranking, and compatible comparisons | Sprint 2 S2-04 |
| DASH-AUDIT | Implement profile evidence, content patterns, and explainable findings | Sprint 2 S2-05 |
| DASH-RELIABILITY | Measure and improve fetching, caching, refresh coordination, loading, partial failure, saved-data display, and reconnect feedback | Sprint 2B |
| DASH-COLLECTION | Decide automatic collection frequency, quotas, user preferences, and scheduling after manual collection is proven | Sprint 2B planning |

## Remaining product areas

| Area | Requirement linkage | Present assessment and next evidence |
|---|---|---|
| Planner and durable drafts | PLAN-01/02/06, NOTIF-01/02/03 | Separate sprint. Implement ownership, draft CRUD/autosave, dates/statuses, and reminder behavior |
| Grounded AI Chat | AI-01 through AI-08 | Provider capability and no-cost availability need verification. Deliver a narrow account-scoped analysis path first |
| Image-led content and creator voice | CONT-01 through CONT-09 | Implement editable generated packages, media association, factual constraints, and user-controlled prohibited expressions |
| Competitors | COMP-01 through COMP-04 | Verify permitted access and five-latest-post qualification before claiming availability |
| Topic discovery, ideas, swipe workflow | DISC-01 through DISC-05 | Establish attributable sources, save/pass persistence, and connections to drafting |
| Official Instagram/Edits updates | NEWS-01 | Establish source retrieval, dates, attribution, and clear inference labels |
| Explicit user-approved publishing | PLAN-03/04/05, AUTH-08 | Prove API capability, exact-version approval, and ambiguous-outcome handling before enabling |
| Device, privacy, performance and recovery | UX, SEC, PERF, REL, EFF, COST requirements | Verify progressively, with release acceptance evidence and visible limitations |

## Tracking rule

Planning follow-through remains open. Recover the previously referenced 66-story Product Backlog v0.1 or map the current SRS requirements into a single maintained story register. Record actual hours and accepted outcomes at each sprint review before estimating a completion percentage or committing later sprint dates.

Move an item to completed only with a code change or documented decision plus relevant verification. Preserve requirement IDs when deferring work. Sprint 1 completion covers the agreed working connection slice and does not close every authentication/privacy requirement in the full SRS.

## Instagram connection persistence investigation — 14 November 2026

User report: Instagram appears disconnected after the browser or Trellis session ends, requiring authorization again.

Findings from the current code and local database:

- The connection and encrypted token are stored in `instagram_connections`, linked by `user_id`. The local database still contains one saved connection for Trellis user 3 and `glowithuzma`.
- Logout destroys the SCS session. It contains no instruction to delete the saved Instagram connection.
- Sign-in creates a session with the existing Trellis user ID. Angular then requests `/auth/instagram/connection` and routes to the dashboard when the saved connection is found.
- The session cookie is persistent and the session lifetime is 24 hours. Browser closure alone should preserve a normal browser session within that lifetime. A missing or expired cookie requires Trellis sign-in before the saved account can be looked up.
- The dashboard currently offers “Reconnect Instagram” for every profile-request error. A database, token-decryption, network, or Meta error can therefore look like a disconnected account. This feedback needs correction.
- The database path is relative (`./users.db`), as are local configuration paths. The development launcher uses `Backend` consistently. Different manual launch directories could select another database/configuration, but this has not been established as the reported cause.

Verification added to `Backend/session_test.go` checks that a saved account link remains readable after backend restart and after logout followed by a new sign-in. It also checks that a missing or destroyed session cannot read the connection. The regression check and `go test ./...` passed on 14 November 2026. This uses a seeded connection and does not establish live token validity or reproduce browser cookie behavior.

Root cause remains unconfirmed. On recurrence, record the status and safe error message from `/me`, `/auth/instagram/connection`, and `/auth/instagram/profile` after signing back in to the same Trellis account. Record whether normal or private browsing was used. Never record cookie values or tokens.

Completion requires a live browser-close/reopen and sign-in check, a new-session check, and a backend-restart check showing the same saved connection without another Meta authorization while its token remains valid. Handle genuine revocation or invalid credentials with explicit recovery feedback.

## Analytics history and performance — 14 November 2026

Rollback requested by the user on 14 November 2026. The cache, saved-history option, client extraction, and concurrent collection were removed so the implementation can be learned incrementally. Daily metric requests run sequentially again. The implementation findings below describe the removed trial. Caching and concurrency remain deferred work under DASH-RELIABILITY and ANALYTICS-COLD-LOAD. Existing cache rows were retained in SQLite, and the application no longer reads or writes them.

- The 30-day period is an application choice. Establish the Instagram account-insights retention limits per metric and the earliest retrievable dates before offering older backfilled periods. The supplied account-insights reference does not state a universal maximum. Demographic timeframe restrictions are separate from account-interaction date ranges.
- “All saved history” displays measurements retained in SQLite. It cannot claim account-lifetime coverage. Resolve historical gaps and any Meta data-retention/deletion obligations before a hosted release.
- Daily total requests now run with up to four concurrent Meta calls. Concurrency reduces elapsed time but retains the same call count. Larger total-value ranges yield an aggregate, not the daily points needed for this chart.
- Cache responses persist by user, Instagram account, metric, metric type, and exact interval. The initial freshness policy is one hour. Recent values may still change because Meta documents delays of up to 48 hours. Review the policy using observed traffic and rate-limit headers.
- Compare cold, warm, overlapping week/month and backend-restart timings using the request's X-Analytics-Cache and Server-Timing headers plus safe backend summary logs. The user's original cold month requests were approximately 37 seconds for Views and 34 seconds for Likes. Preserve measured timings separately from expectations.
- Evaluate coalescing simultaneous requests for the same uncached interval and grouping compatible metrics per daily request if actual usage warrants it. No automatic history backfill or automatic scheduled collection is configured.

### ANALYTICS-COLD-LOAD — Reduce an uncached monthly chart to five seconds

Status deferred by user on 14 November 2026. Destination Sprint 2B, linked to DASH-RELIABILITY.

User-reported baseline after persistent caching and four-request concurrency is approximately 10 seconds for an uncached monthly chart. Cached charts return in milliseconds. The target is at most five seconds for a newly fetched chart. Resume this optimization after the remaining Analytics features are implemented.

The current total-value path makes up to 30 daily Meta requests. Capture per-request latency, overall collection time, cache status, and rate-limit headers before choosing a change. Evaluate compatible multi-metric daily requests, supported Graph API batching, shared in-progress requests, and an evidence-based concurrency limit. Grouping metrics mainly improves subsequent metric selections; establish its effect on the first uncached graph separately.

Completion requires recorded before/after measurements for the same account, metric, dates, and cache state, including typical and slower runs. Preserve correct daily values, chronological ordering, missing values, account isolation, cancellation, and rate-limit handling. Retain the cached response's current speed. Five seconds remains a performance target pending measurement.


### ANALYTICS-PERIOD-COMPARISON — Compare periods within the existing graph

Deferred by the user on 14 November 2026 at 7:38 PM. Removed the separate Period comparison card from Analytics. Continue the current sprint with Top posts and Audience breakdown.

Later, let the user compare the selected metric with the preceding period of equal length within the existing graph. Show exact date ranges, both period totals, the numerical difference, and percentage change when the previous total is nonzero. Keep missing data distinct from zero. For unique-account metrics such as reach, obtain the period total rather than adding daily unique counts. The current monthly graph lets users visually inspect adjacent weeks; it does not calculate an exact period comparison.


### ANALYTICS-AUDIENCE-VISUALS — Review alternative demographic charts

Added by the user on 15 November 2026. Defer visual refinements until the remaining dashboard features are implemented. Explore different graphs for age, gender, countries, and cities across followers, reached audience, and engaged audience. Keep counts, reporting windows, and the meaning of percentages clear. The current bars and ranked lists are the initial implementation.


### DASH-AUDIT-DEFERRED — Return to Profile audit after Planner

Deferred by the user on 15 November 2026. Preserve the product-owner scope: analyze bio, published content and performance, show actionable findings with evidence and uncertainty, and allow discussion in Chat. Daily/manual refresh and unfollow investigation are requirements, not implemented features. The existing page remains a placeholder; AI is not configured.

### ANALYTICS-RANKING-SELECTOR — Choose the Top posts metric independently

Deferred by the user on 15 November 2026. Add a separate ranking metric selector later. Top posts currently uses the graph metric and ranks lifetime insights for posts published in the selected period.

### PLANNER-PERSISTENCE — Save manual drafts and their media to the account

The 15 November frontend prototype supports manual text, local image/video selection, preview, temporary save/edit/delete, and one draft per calendar date. Leaving Planner or refreshing loses drafts and files. Persist drafts and media per signed-in user in a later authorized backend increment; scheduling, approval, publishing, AI and multiple posts per date require separate work. Profile audit remains deferred while Planner is explored.
