# Trellis Sprint 2 — Dashboard Functionality

| Planning item | Detail |
|---|---|
| Version | 0.1 |
| Created | 8 November 2026, Asia/Riyadh |
| Status | Scope agreed in conversation. Detailed tasks proposed for implementation |
| Target timebox | Approximately one week. Proposed dates 8–14 November 2026, subject to developer availability |
| Implementation owner | Hussain |
| Stack | Angular, Go, SQLite, SCS sessions, Instagram API with Unified Login |
| Included tabs | Overview, Analytics, Profile Audit |
| Follow-up | Sprint 2B for dashboard performance and resilience. Separate sprint for Content Planner |

## 1. Sprint goal

### November 9 interaction decision

Prioritize content quality, planning, and relevant ideas while keeping Overview uncluttered. The first UI increment separates Overview, Analytics, and Profile Audit components and retains the existing follower count. Overview uses clearly labelled static sample opportunity notes. Clicking a note opens AI Chat with fictional sample context and an editable suggested prompt. The user must press Send. AI-backed opportunities and additional live data are future work. The recent-post preview remains a proposal requiring agreement. Analytics and Profile Audit retain placeholder content during this increment.

Deliver a usable dashboard across Overview, Analytics, and Profile Audit using the authenticated user's connected Instagram account. Replace the existing placeholders with real measurements, calculated results, and explainable findings wherever verified data is available.

Users should be able to understand their current account, inspect available performance over time, and identify a practical profile or content improvement supported by evidence.

## 2. Starting position

Sprint 1 delivered registration, sign-in, sessions, logout, Instagram authorization, account discovery, encrypted token storage, and account confirmation. Returning users with saved connections route to the dashboard. Backend startup loads local configuration, and the dashboard offers reconnection with a return to the dashboard after successful authorization. The user confirmed the repaired flow works.

The current dashboard retrieves the account ID, username, and follower count through `GET /auth/instagram/profile`. Overview displays the follower count. The remaining metric cards, Analytics panels, and Profile Audit sections largely contain placeholder content.

The existing Angular component and template are `Frontend/src/app/workspace/dashboard.ts` and `dashboard.html`. Backend integration currently lives in `Backend/oauth.go`, with routes registered in `Backend/main.go` and SQLite table creation in `Backend/users.go`.

## 3. Relationship to existing project plans

This document records the current Sprint 2 agreement. The earlier roadmap proposed broader analytics, conversation, and planner work with different dates. This sprint focuses on the three dashboard tabs. Chat and planner requirements remain in the product backlog.

The architecture baseline proposes PostgreSQL and additional infrastructure. This sprint uses the working SQLite implementation. A database migration or new job infrastructure would require separate scope planning.

Profile Audit begins with transparent rules and calculations derived from the user's account data. This is the proposed implementation approach for the one-week target. Richer AI analysis, creator-voice interpretation, and competitor evidence remain future work.

## 4. Scope and dashboard mapping

| Existing area | Sprint 2 deliverable | Completion evidence |
|---|---|---|
| Overview account identity | Real username and available profile details, including photo, biography, and media count where supported | Values match the connected account and unavailable fields have a clear state |
| Overview performance cards | Current followers and supported reach, views, and engagement measurements | Each populated card identifies its meaning, reporting period, and source time |
| Overview opportunity | Highest-priority applicable finding from Profile Audit | The suggestion links to its evidence and a concrete next action |
| Overview recent content | A bounded list of recent posts with available details and metrics | Items have real IDs, dates, formats, and links where supplied |
| Analytics period selector | Working supported date windows | Changing the selection changes the requested or selected dataset and displayed coverage |
| Analytics historical trend | A chart using provider history or saved observations | Points represent actual measurements with dates and visible gaps |
| Analytics freshness panel | Last successful observation, last check, and coverage | A failed check does not advance the successful observation timestamp |
| Analytics follower changes | Difference between compatible follower observations | Shows the actual observation window and requires at least two valid measurements |
| Analytics top posts | A ranking by one explicitly named, available metric | Ranking and sample window are visible and missing values remain distinguishable |
| Analytics period comparison | Comparison of compatible periods when sufficient data exists | Formula, compared dates, and coverage are clear |
| Analytics audience breakdown | Display only after availability is established for this account | Verified data is shown, or the panel explains the specific availability limitation |
| Audit profile snapshot | Actual profile fields and observation date | Missing biography or other fields are handled without invented content |
| Audit content patterns | Observed format mix and posting intervals over the retrieved sample | Findings identify the sample size and dates |
| Audit recommendation | Explainable profile or content improvement | Finding includes evidence, rule or calculation, limitation, and suggested action |

The API capabilities for these proposed fields and metrics still require verification. A visible placeholder does not establish that Meta exposes the required data. Record unsupported items and the agreed presentation before implementing each panel.

## 5. Sprint backlog

### S2-01 — Verify fields, metrics, and coverage

**Priority P0. Dependencies none.**

- Review current official Meta documentation for the configured Unified Login flow and API version.
- Map every included dashboard area to an endpoint, fields, permissions, supported account/media types, and reporting period.
- Verify availability with the connected account using the backend-issued token.
- Record the exact nonsecret request, response shape, date, coverage limits, and any API error.
- Define the displayed meaning of engagement. Choose a supported count or an explicit calculation, including its denominator if expressed as a rate.
- Confirm which of the existing 7-, 30-, and 90-day options can be supported. Disable or remove unavailable windows with an explanation.

**Acceptance criteria**

- Every planned metric has a recorded status of verified, unavailable, or unresolved.
- Endpoint selection and permission requirements are backed by official documentation links recorded during this task.
- Unresolved access remains visible in the backlog and is never represented by fabricated results.
- The final set of deliverable panels is confirmed after this task.

### S2-02 — Retrieve and persist dashboard data

**Priority P0. Depends on S2-01.**

- Reuse the existing authenticated user and Instagram connection lookup.
- Add the verified profile, recent-media, and insights requests in Go.
- Follow pagination within an explicit collection limit and record when a sample is incomplete.
- Persist the observations needed for history, comparisons, and audit evidence in SQLite.
- Separate measurement period from retrieval time. Store account ownership, metric identity, value or availability, and relevant timestamps.
- Define consistent JSON responses for the three tabs. Decide route names before wiring Angular.
- Make repeated retrieval of the same provider measurement safe to save without duplicating chart points.

**Acceptance criteria**

- Each request accesses only the authenticated user's connected account.
- Tokens and app secrets remain server-side.
- Stored records survive a backend restart.
- A genuine zero, missing measurement, and failed request remain distinguishable.
- Requests are bounded by timeouts and return useful failure responses.
- Retrying a collection does not corrupt history or inflate calculations.

### S2-03 — Complete Overview

**Priority P1. Depends on S2-02 and the findings produced by S2-05.**

- Populate profile information and the verified metric cards.
- Add recent posts using the agreed collection window.
- Present an audit finding as the opportunity when evidence supports one.
- Connect Overview links to the relevant Analytics and Audit sections.
- Replace preview text in the included areas with actual content or accurate availability messages.

**Acceptance criteria**

- Account identity and measurements match the backend response.
- Metric labels include units and periods where applicable.
- A user can follow an opportunity to its supporting evidence.
- Sparse account data produces a usable page with an explanation.

### S2-04 — Complete Analytics

**Priority P1. Depends on S2-02.**

- Wire the period selector to supported data windows.
- Render historical measurements and coverage gaps.
- Calculate follower changes from available observations.
- Rank eligible posts using the selected metric.
- Add period comparison where dates, definitions, and coverage are compatible.
- Show audience information if S2-01 confirms access.

**Acceptance criteria**

- Chart values and calculations can be traced to stored or returned observations.
- Date filtering uses a consistent timezone and documented interval boundaries.
- A single follower observation produces an insufficient-history state for growth.
- Percentage comparisons handle a zero baseline explicitly.
- Post lifetime totals are labelled accurately if they cannot represent the selected period.
- Missing periods are visible in chart coverage.

### S2-05 — Complete Profile Audit

**Priority P1. Depends on S2-02.**

- Display the real profile and biography snapshot.
- Define a small set of deterministic checks for available profile fields and recent content.
- Calculate observed posting intervals and format distribution where data permits.
- Produce findings with evidence references, sample dates, and practical next actions.
- Choose an applicable finding for Overview.

**Acceptance criteria**

- Every finding identifies the data and rule that produced it.
- Recommendations clearly express uncertainty and avoid unsupported claims about what caused engagement or follower changes.
- Incomplete retrieval limits the stated scope of a finding.
- The same inputs and rule version produce the same findings.
- Insufficient evidence yields a clear availability message.

### S2-06 — Verify and close the sprint

**Priority P0. Depends on S2-03, S2-04, and S2-05.**

- Check the three tabs through the normal sign-in and dashboard flow.
- Test numerical calculations with representative fixed inputs.
- Verify ownership checks using separate users.
- Check missing data, denied access, empty media, and API failure behavior.
- Check the existing Instagram connection after logout, login, and backend restart.
- Run relevant Go tests, frontend tests, and the Angular build.
- Record remaining limitations and hand off measured behavior to Sprint 2B.

**Acceptance criteria**

- No known blocking defect remains in the included user journeys.
- Numerical and authorization checks pass.
- Live verification is recorded separately from automated tests using simulated provider responses.
- Unfinished tasks retain an explicit status and reason.

## 6. Proposed execution sequence

| Day | Focus | Expected outcome |
|---|---|---|
| 1 | S2-01 | Confirm data availability, metric definitions, and achievable scope |
| 2 | S2-02 | Implement authenticated collection and SQLite observation storage |
| 3 | S2-03 and S2-04 | Populate Overview measurements and establish Analytics datasets |
| 4 | S2-04 | Complete charts, supported filters, rankings, and calculations |
| 5 | S2-05 | Implement evidence-based audit findings and Overview opportunity |
| 6 | Cross-tab integration | Finish UI bindings, availability states, and functional defects |
| 7 | S2-06 | Regression verification, review, commits, and Sprint 2B handoff |

This sequence is a planning estimate. Actual daily capacity has not been reconfirmed. Verify scope after Day 1 and adjust the plan if API access or implementation effort exceeds the timebox. Record any deferred panel explicitly.

## 7. Functional baseline and Sprint 2B boundary

Sprint 2 includes enough loading, empty, error, and reconnection behavior to make the three tabs usable. Existing authentication, configuration loading, token encryption, and reconnect behavior must continue working. A failed collection must preserve the integrity of saved observations.

Sprint 2B will assess the completed dashboard and improve the following areas.

- Request count, duplicate fetching, and unnecessary Meta calls.
- Database queries, indexes, pagination, response sizes, and chart rendering.
- Cache policy and reuse of saved observations.
- Refresh coordination, throttling, retry behavior, and rate-limit recovery.
- Showing saved data promptly while new measurements load.
- Partial loading and partial failure across dashboard sections.
- Reconnection feedback, stale-data presentation, and actionable recovery.
- Measurements of initial load, refresh duration, and repeated navigation.

Scheduling automatic collection remains a follow-up design decision. Sprint 2 starts with explicit refresh and records observations obtained through that flow.

## 8. Deferred scope

- Content Planner, draft CRUD, calendar workflows, scheduling, and publishing.
- Grounded Chat, AI-generated narrative audits, and competitor-based recommendations.
- Setup-page preview and placeholder cleanup already recorded in the backlog.
- Proving the original cause of empty Instagram discovery responses, tracked in `INSTAGRAM-ISSUE.md`.
- Database-platform migration, background-job infrastructure, and account deletion.
- Performance optimization and expanded recovery behavior assigned to Sprint 2B.

Planner and Chat navigation should accurately communicate their availability during this sprint. Their presence in the existing layout does not expand the implementation scope.

## 9. Risks and decisions to resolve

| Risk or open decision | Required handling |
|---|---|
| Reach, views, audience data, or media insights may have access or eligibility restrictions | Resolve during S2-01 and retain documented unavailable states where required |
| API history may cover less than the selected range | Report actual coverage and use saved observations only for dates genuinely observed |
| New follower snapshots cannot establish earlier growth | Accumulate history from collection onward and explain insufficient samples |
| Engagement meaning is ambiguous | Agree on a named metric or formula before displaying the card |
| Media sample limits can distort audit conclusions | Attach sample size, dates, and completeness to findings |
| One-week delivery depends on available hours | Reassess after capability verification and prioritize the usable core of each tab |
| Several connections may eventually belong to one Trellis user | Use the current selected-account behavior and record multi-account selection as a separate design decision |

## 10. Definition of done

- [ ] The capability mapping and metric definitions are recorded with official documentation references.
- [ ] Overview displays verified profile information, available measurements, recent content, and a supported audit opportunity.
- [ ] Analytics displays real observations with functional supported filters, accurate calculations, and coverage information.
- [ ] Profile Audit displays account evidence and explainable findings.
- [ ] Saved dashboard observations survive restart and remain associated with the correct user and account.
- [ ] Unavailable data, zero values, and request failures have accurate representations.
- [ ] Session persistence, returning-user navigation, encryption, and reconnection still work.
- [ ] Relevant automated checks and a live walkthrough pass.
- [ ] Remaining limitations are documented and Sprint 2B has a concrete handoff.
- [ ] Completed work is reviewed and committed under the user's release workflow.

## 11. Sprint review walkthrough

Sign in as a returning user, open Overview, inspect the profile and metrics, then follow a finding to Profile Audit. Review its evidence and sample window. Open Analytics, change a supported period, inspect the trend and post ranking, and explain the available history. Refresh data, restart the backend, and verify stored observations and the Instagram connection remain accessible. Confirm a second user cannot retrieve the first user's records.

Record which panels were verified live, which were exercised with test data, and which remain constrained by provider availability. Use this review to establish Sprint 2B priorities.

## 12. Project references

- `Documentation/Trellis_SRS_v1_1.md` for product requirements and evidence expectations.
- `Documentation/Trellis_Architecture_v0_2.md` for ownership, observation provenance, and longer-term architecture.
- `Documentation/Trellis_Product_Roadmap_v0_1.md` for the broader product backlog and earlier planning baseline.
- `INSTAGRAM-ISSUE.md` for the discovery investigation and deferred setup preview work.

Current Meta endpoint and metric documentation will be collected and checked in S2-01. This plan does not assert that all proposed metrics have already been verified.
