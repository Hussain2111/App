# Trellis Product Roadmap

> Current forecast added 8 November 2026 in Section 9. Sections 1–8 preserve the October planning baseline. Use the current Sprint 2 plan and BACKLOG.md for active work. The separately named Product Backlog v0.1 is absent from this repository snapshot.

**Version:** 0.1  
**Date:** 24 October 2026 (Asia/Riyadh)  
**Status:** Planning baseline agreed in principle; Sprint commitments and Product Owner release acceptance pending  
**Owner:** Scrum Master / sole developer; Product Owner retains business-priority and acceptance authority  
**Source of truth:** BRD v1.1, SRS v1.1, Architecture v0.2 and Product Backlog v0.1

## 1. Release intent and governing decisions

**Trellis v0.1 working MVP target: 31 December 2026.** This is an ambitious, non-commercial personal-development release. We are aiming to produce the **most substantial coherent product supportable by available capacity**, not the smallest possible shell that can be labelled an MVP. A December release is not expected to pass every final-product SRS test or offer mature, flawless AI.

- **All Product Owner requirements remain required for the complete product.** A feature not finished by December stays visible with its original requirement ID and future acceptance conditions. Partial demonstration is not equivalent to final completion.
- **Time is targeted; implemented breadth is adaptive.** If planned work completes early, pull the next ready, high-value stories rather than stop. No requirement is removed merely to meet the date.
- **Quality has boundaries.** Experimental AI accuracy, limited topics, lower performance and some unimplemented convenience functions may be acceptable if disclosed. Cross-user data exposure, fabricated observations, unapproved publishing, silent paid API use, hidden credential leakage and knowingly invalid publication states are not.
- **External sources remain unverified until tested.** Source-dependent capabilities may be blocked; sample/fixture demonstrations must be clearly labelled and must never be passed off as live capability.
- **No commercial launch or deployment is assumed for 31 December.** A local, demonstrable, integrated browser application is the baseline. A separately agreed hosted release requires its own operational/security decision.

## 2. Capacity and Scrum cadence

One human developer. Daily availability varies from approximately **1-2 to 4-5 hours**. There is no guaranteed weekly total. Initial planning range for observation only: **10-20 hours per week**, subject to correction using logged available hours. Avoid promising more than actual capacity.

- **Sprint 0:** 26 October-1 November 2026 (one-week discovery/design timebox).
- **Implementation:** four two-week sprints, 2 November-27 December 2026.
- **Final MVP evaluation:** 28-31 December 2026; critical repairs may be done then, but this is not a substitute for testing in each sprint.
- **Scrum meetings for a solo developer:** short weekly capacity check; sprint planning, demonstrable sprint review with PO, retrospective; daily private task check-in only when useful. Do not count planning overhead as feature delivery.
- **Capacity practice:** estimate stories/tasks in hours or small relative sizes only after clarification; plan conservatively against actual days available; reserve time for integration, testing and interrupted days. Reforecast at every sprint review.

## 3. Dated release plan

| Dates | Phase | Design work | Target engineering outcome | Verification and decision |
|---|---|---|---|---|
| **26 Oct-1 Nov** | Sprint 0: discovery and design | User journeys, navigation map, low-fidelity flows for all major product surfaces; prioritised iPad-first wireframes | Core Meta, free AI, privacy and device feasibility probes; identify blockers and API/data contracts | Evidence-labelled spike outcomes, design review, Sprint 1 ready slice. Incomplete spikes remain open. |
| **2-15 Nov** | Sprint 1: foundation / first vertical slice | Slate/teal tokens, spacing/type/component patterns; clickable Dashboard/account flow | Angular/Go/PostgreSQL skeleton, secure sign-in, attempted official account connection, first data-to-Dashboard path with provenance | Route/ownership checks, denied-account paths, iPad screen review, provider fixture-vs-live labelling |
| **16-29 Nov** | Sprint 2: analytics / conversation / planner foothold | Dashboard chart and metric states, Chat flows, planner day/draft interaction | Basic post comparisons, freshness/refresh, initial grounded Chat, draft/plan entry where ready | Numerical fixture checks, missing-data states, AI tool scoping, saved-state recovery |
| **30 Nov-13 Dec** | Sprint 3: content / discovery | Image upload/editor, banned-language controls, swiper cards and alternative buttons | Image-led editable post generation, prohibited expression enforcement, draft editing, first dated/source-labelled ideas and save/pass capability | End-to-end content fixture, user-ownership, ban matching, source attribution, iPad touch checks |
| **14-27 Dec** | Sprint 4: breadth / integration | Competitor comparisons, official-update cards, reminders and publishing approval flow where feasible | Expand competitors, Hot Topics, planner integration, Instagram/Edits updates, possible explicit-approval publishing proof depending on permission; integrate and refine previous slices | Five-of-five rule for any claimed qualified competitor, no invented source claims, explicit-publish safety tests if implemented |
| **28-31 Dec** | MVP checkpoint and review | Screen-flow usability improvements and known-issues review | Demonstrable connected product; targeted high-impact bug fixes; documented limitations and January backlog | PO walkthrough, evidence-backed feature matrix, blockers/known defects, release decision |

**These columns express sequencing intentions, not a promise that every story fits the date window.** Cross-cutting privacy, responsive UX, tests and honest states happen in every sprint. Features that are blocked in one sprint may shift into the next; newly ready work may be pulled forward.

## 4. December product breadth target

| Product area | December aspiration | Allowed immaturity | Never represent as complete if... |
|---|---|---|---|
| Identity and own Instagram connection | Authorized identity, connection state, usable profile/media where permitted | Permissions or fields may limit available data | The live authorization/data path is unproven; a test fixture is masquerading as an account |
| Dashboard and analytics | Post metrics, simple comparisons, audit opportunities, source/freshness labels | Some demographics, long history and follower hypotheses may be incomplete | Unavailable data is shown as observed fact |
| AI Chat | Natural questions answered using at least one scoped, verifiable analysis path | Limited accuracy, speed, memory and fallback breadth; user-visible failure | Calculations are invented or private data escapes user scope |
| Content generation and creator voice | Image-led structured editable draft, placeholders, creator examples when accessible, active banned expression list | AI phrasing and tone will need refinement | Ready-to-use text violates an active ban or fabricates user experiences |
| Dashboard planner | Create, save, position and edit planned content by day | Advanced reminders/version recovery may continue after December | Draft changes disappear silently or planning authorizes publishing |
| Hot Topics, niche ideas and swiper | Sourced idea cards, save/pass interaction and a route toward drafting/planning | Coverage/recency/recommendation ranking may be limited | Fabricated trends or false verified evidence appear |
| Competitor comparison | Selected/skincare candidate checks and limited comparisons where source permits | Source access may constrain live discovery and measures | A competitor with fewer than 5 of 5 latest skincare posts is labelled qualified |
| Instagram and Edits updates | Attributed dated official-update browsing | Initial curation may be manual and limited | An interpretation is presented as an official announcement |
| Publishing and reminders | Planner-to-reminder and approval UI attempted; live publish only if feasibility and safe state handling proven | Publishing may be blocked by provider permissions | Unapproved/duplicate/unknown-outcome publication is possible |
| iPad, desktop and mobile | Coherent navigation; core editing works at relevant device sizes | Fine polish and performance improvements continue | Key controls are inaccessible or privacy/security boundaries fail |

**Labels per capability on 31 December:** `Working / Verified`, `Working / Experimental`, `Prototype / Fixture-only`, `Blocked`, `Not yet started`. These labels describe release maturity and do not change final requirement acceptance.

## 5. Product and UI/UX design lifecycle

Technical **system architecture** is documented separately. **Product design** is an explicit part of this roadmap, not a post-coding task:

1. **Discovery and information architecture (Sprint 0).** Inventory every user journey; confirm PO-approved top-level navigation and feature placement; sitemap; important empty/error/blocked states; iPad-first low-fidelity wireframes. Review flows before implementing shell/navigation.
2. **Visual design system and prototype (Sprint 1).** Slate/teal tokens, typography, spacing, controls, card/table/editor patterns, interaction feedback, responsive breakpoints and first clickable workflow. Check layout on a real iPad where possible.
3. **Just-in-time detailed design (each sprint).** Before coding a story, agree the task flow, information/permissions, wireframe, UI states, API contract and testable acceptance. Use reusable patterns rather than redesigning every view.
4. **Validation and iteration (each review).** PO sees the actual product, tests critical paths and records usability problems. Design defects enter the same backlog and may change next sprint sequence.

**Design outputs:** navigation/site map; workflow map; low-fidelity screen sketches; visual-style tokens/component inventory; responsive iPad test matrix; screen-state inventory; prioritized usability backlog. High-fidelity mocks of the entire product are **not** a prerequisite to start Sprint 1.

## 6. Milestones and release quality gates

| Checkpoint | Minimum evidence | Decision owner |
|---|---|---|
| Sprint 0 exit, 1 Nov | Ranked risk register; highest-dependency spike results; initial sitemap/wireframes; first vertical slice readiness | Developer + PO |
| Sprint 1 review, 15 Nov | Running app shell and data-path evidence, with sample/live distinction | Developer demonstration; PO feedback |
| Sprint 2 review, 29 Nov | Demonstrated analytics/Chat or planner work; actual capacity and velocity measured | Developer + PO |
| Sprint 3 review, 13 Dec | Working draft generation/edit path and discovery progress; no banned words marked ready | Developer + PO |
| Sprint 4 review, 27 Dec | Integrated workflow breadth and remaining risk inventory | Developer + PO |
| MVP decision, 31 Dec | Demonstrable integrated product, verified safety checks, honest feature-maturity matrix, known-issue list, January backlog | PO decides suitability as v0.1 |

At the end of each sprint capture: hours available/spent, completed accepted stories, partially demonstrated stories, provider blockers, outstanding tests, user-visible value, and forecast changes. Never record a partly working story as Done against the full SRS criteria.

## 7. Major risks and response

| Risk | Response |
|---|---|
| Meta permissions/accounts/quotas cannot support required fields | Prove fields early; retain missing metrics as `Unavailable`; keep blocked stories and escalate decisions without unauthorized collection. |
| Competitor access or exactly-five-post evidence unavailable | Preserve 5/5 validation; label Unknown if missing evidence, do not invent public data; continue UI with clearly marked fixtures only. |
| Free AI quality or rate limits fail | Implement narrow grounded path with source-backed deterministic calculations, explicit rate-limit messaging; no hidden paid fallback. |
| Developer weekly hours are lower than expected | Re-plan sprint forecasts using actual time; pull smaller vertical slices, not remove requirements. |
| Design consumes all discovery time | Keep low-fidelity flows and reusable design system; shift high-fidelity detail just ahead of implementation. |
| External publishing cannot safely be verified | Hold outbound publishing behind explicit feature unavailability, retain approval workflow and story dependency. |
| Too many immature features degrade integration | Enforce demoable end-to-end paths and critical automated/manual checks; reserve the December review window for high-impact defects. |

## 8. Management and approval

- This roadmap adds release sequencing only; the approved BRD/SRS remains the source of final requirement intent.
- Product Owner approves business order and MVP acceptance. Developer estimates technical effort and reports evidence. Scrum Master facilitates review, scope traceability, risk and sprint planning; the user may hold multiple roles.
- All 9 epics, 66 user stories, 7 spikes and 7 enablers remain on the full backlog. Move stories into a sprint when Ready; do not duplicate or silently demote requirements.
- **Full-product completion date is intentionally not claimed yet.** Reforecast after Sprint 2 using actual throughput and external dependencies. December 31 is the first meaningful MVP checkpoint, not cessation of work.

**Historical next action:** The original October plan directed Sprint 0 discovery. The active next action is Sprint 2 capability verification under Trellis_Sprint_2_Plan_v0_1.md. The Sprint 0 plan is retained in Archive/.

## 9. Release forecast updated 8 November 2026

The December 31 milestone remains an integrated, demonstrable MVP. There are 53 days from November 8 to December 31, approximately 7.6 weeks. At the earlier planning assumption of 10–20 hours per week, that provides roughly 76–151 gross hours. Availability has not been reconfirmed and actual delivery throughput has not been logged, so this range is a capacity scenario rather than a completion estimate. Reserving 25 percent for integration, testing, interruptions, and fixes would leave roughly 57–114 hours for planned feature work.

### Delivered and pending

| Area | Current evidence | Forecast implication |
|---|---|---|
| Trellis identity and Instagram connection | Working development flow, encrypted persistence, returning-user routing, reconnect recovery, and real follower count. Go suite and 31 frontend tests passed at closeout | Foundation milestone reached before the original November 15 review date, with carryover gaps recorded |
| Dashboard | Layouts and current follower count exist. Overview, Analytics, and Audit implementation now planned in Sprint 2 | Near-term priority. Broader insights/history remain subject to field verification |
| Refresh/performance/recovery | Initial loading/error and reconnect behavior exists | Dedicated Sprint 2B follows the completed dashboard |
| Planner and durable drafts | No implemented backend delivery established in the closeout | Separate sprint required |
| AI Chat and content generation | No working provider-backed end-to-end delivery established by this review | Significant remaining work, including capability and free-tier validation |
| Competitors, topic discovery, official updates | Requirements and UI designs exist. Permitted live data paths remain unproven in this review | External dependency risk and substantial remaining implementation |
| Explicit publishing | Requirements exist, but a verified publishing implementation is not established | Capability and safe outcome handling require separate evidence |
| Privacy, ownership, device acceptance | Partial controls exist. Carryover identifies one-account enforcement, explicit link confirmation, lifecycle controls, and further tests | Must be planned alongside feature delivery |

### Proposed remaining sequence

| Window | Proposed focus | Exit evidence |
|---|---|---|
| November 8–14 | Sprint 2 dashboard functionality | Verified metrics, working Overview/Analytics/Audit, truthful coverage and usable failure states |
| November 15–18 | Sprint 2B | Measured refresh/loading behavior, saved-data recovery, and prioritized performance fixes |
| November 19–25 | Separate planner sprint | Owned durable drafts, editing, dates/statuses, and session-interruption recovery |
| November 26–December 9 | Grounded AI and content creation | A working account-scoped question flow and editable image-led draft flow, subject to provider verification |
| December 10–20 | Highest-priority remaining product breadth | Select ready discovery, competitors, updates, or publishing work based on actual capacity and verified access |
| December 21–27 | Integration, creator/device acceptance, and critical gaps | End-to-end creator walkthrough with ownership, persistence, and failure checks |
| December 28–31 | Final MVP evaluation | Capability matrix, known limitations, remaining backlog, and user acceptance |

Only the Sprint 2/2B focus and separate planner scope have been agreed. Dates and later sequencing in this table are a proposed forecast. Reforecast at the end of Sprint 2 using actual hours and accepted outcomes. Earlier Sections 2–3 retain the October cadence for historical comparison.

### Deadline assessment

A coherent MVP by December 31 remains plausible, but confidence is conditional. Completing the entire BRD/SRS to its full acceptance criteria by that date is high risk at the documented capacity. Completing the connection foundation resolves a major dependency, while analytics definitions, stored history, AI behavior, drafts, and external discovery sources still require distinct implementation and verification.

The project is ahead of the original foundation review date. That does not establish that the full product is ahead of schedule. No percentage-complete claim is justified without a maintained story inventory and actual throughput.

At the Sprint 2 review, record available hours, hours spent, accepted panels, access blockers, and defect carryover. If dashboard scope exceeds the week or provider access blocks planned metrics, adjust subsequent windows explicitly. Preserve the final integration period and retain unfinished requirements in BACKLOG.md with clear release-maturity labels.
