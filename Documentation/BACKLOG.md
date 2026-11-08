# Trellis Working Backlog

Updated 8 November 2026. This register records implementation gaps and sprint allocations. The BRD and SRS retain the complete product requirements. Status is open unless stated otherwise. Priorities identify proposed order, subject to user planning.

## Sprint 1 carryover

| ID | Work and completion condition | Priority | Destination |
|---|---|---|---|
| IG-001 | Establish the cause of the original empty Instagram discovery response using comparable request/token evidence. Investigation is in ../INSTAGRAM-ISSUE.md | Deferred | Investigation backlog |
| IG-002 | Finish setup-page previews, demo copy, responsive layout, loading/error content, and button spacing across Steps 1–3 | P2 | UI cleanup |
| AUTH-02-GAP | Enforce one connected Instagram account per Trellis user, define replacement behavior, and migrate any duplicate user connections safely | P1 | Before multi-user acceptance |
| AUTH-03-GAP | Save a pending authorization until explicit identity confirmation, or obtain a documented product decision on the current save-before-confirm flow | P1 | Connection completion |
| AUTH-05-07-GAP | Implement disconnect/replacement, explicit retention choice, and separate account deletion with clear data effects | P1 | Account lifecycle sprint |
| AUTH-VERIFY | Verify cross-user reads/writes, link replacement, OAuth error/state expiry/replay, and the complete logout/login/backend-restart sequence. Record live and automated evidence separately | P1 | Sprint 2 integration review |
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
