# Trellis Software Requirements Specification

> Implementation status, 8 November 2026. The current development application uses SQLite and SCS sessions. References below to PostgreSQL describe the earlier technology direction. The full-product requirements remain tracked, including authentication gaps listed in BACKLOG.md. Sprint 1 completion and its acceptance limits are documented in Trellis_Sprint_1_Closeout.md.

Version 1.1 | 24 October 2026 | Status: revised working baseline pending Product Owner approval

# 1. Scope and reference baseline

This SRS derives from the Trellis Product Owner Feature Requirements
v1.1 and subsequent explicit requirements decisions, dated through 22
October 2026. It documents expected behavior, not the detailed component
architecture. In case of conflict, later explicit user decisions are
recorded in Section 10 pending baseline approval.

## System boundary

Trellis is an iPad-first responsive browser app. The currently chosen
technology direction is Angular/TypeScript frontend, Go backend and
PostgreSQL persistence. AI reasoning is model-led with controlled
backend tools and stored/live retrieval. Current AI and infrastructure
budget is free-tier only. Exact AI providers, Instagram/competitor data
vendors and hosting are not selected.

# 2. Functional requirements — AI and Chat

| **ID** | **Requirement / expected behavior**                                                                                                                                                   |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AI-01  | Interpret natural-language intent rather than enforcing rigid field names or command syntax; infer reasonable defaults and disclose consequential assumptions.                        |
| AI-02  | Use relevant recent chat turns, selectively retrieved prior context and user-instructed cross-chat memory; cross-chat persistent memories require explicit user request.              |
| AI-03  | Select metrics and evidence based on the analytical question; retrieve authorized data using backend-controlled access to historical storage and appropriate current sources.         |
| AI-04  | Ground numerical claims in retrieved measurements, use deterministic computation where appropriate and distinguish observed facts, inferences and unknowns.                           |
| AI-05  | Prefer complete, validated responses over fast but incomplete output; request clarification only when meaningful uncertainty cannot be reasonably resolved.                           |
| AI-06  | Recover from eligible free-provider rate limits/outages through bounded compatible fallback while preserving available context and evidence; never imply success after total failure. |
| AI-07  | Classify applicable output-check needs (calculations, source claims, image/product consistency and prohibited language) without requiring separate AI experiences.                    |
| AI-08  | Support analytics, strategic interpretation, natural writing and grounded official updates; no autonomous publish action through Chat.                                                |

# 3. Functional requirements — content and creator voice

| **ID**  | **Requirement / expected behavior**                                                                                                                               |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CONT-01 | Interpret user images and text to produce a complete editable post package: hook, caption, CTA and hashtags; associate descriptions with correct product/media.   |
| CONT-02 | If first-hand experiences or opinions are not known, produce fillable placeholders or selectable suggestions; do not invent a personal review.                    |
| CONT-03 | Allow users to edit, replace, remove and fill generated sections, then review and save the draft.                                                                 |
| CONT-04 | Learn writing patterns from selected relevant historical captions; personalize tone and avoid robotic, monotonous or generic language.                            |
| CONT-05 | Use competitor materials as evidence for content strategies, hooks and formats, not verbatim or distinctive voice copying.                                        |
| CONT-06 | Let users manually add, edit and remove strict prohibited items. The AI may propose additions/removals based on evidence, but only users activate changes.        |
| CONT-07 | Check generated draft against active prohibited expressions before delivering as ready-to-use content; not-listed acceptable wording is not automatically banned. |
| CONT-08 | Use rejection/edit signals as context without treating an individual edit or rejection as a permanent blacklist entry.                                            |
| CONT-09 | Support guidance on appropriate Reel, carousel or other supported Instagram content formats with rationale.                                                       |

# 4. Functional requirements — Dashboard and metrics

| **ID**  | **Requirement / expected behavior**                                                                                                                   |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| DATA-01 | Present account/bio audit, metrics, follower demographics when accessible, historical comparisons, opportunities and relevant posts on the Dashboard. |
| DATA-02 | Track source timestamps and separate last checked, last updated and original observation/publication date where meaningful.                           |
| DATA-03 | Preserve available account history; prioritize relevant recent posts for current advice without excluding older posts needed for comparisons.         |
| DATA-04 | Support user-controlled metric refresh preference (adaptive, frequent or user-configured as supported), constrained by API quota and availability.    |
| DATA-05 | Offer Refresh Now and clear outcomes; do not claim new metric data when only a freshness check completed.                                             |
| DATA-06 | Refresh Dashboard analysis when a user opens/reloads a session or explicitly requests it, reusing valid unchanged results where appropriate.          |
| DATA-07 | Avoid needless continuous analysis/metric retrieval during active usage, except as required by chosen refresh preference or active operation.         |
| DATA-08 | Assess follower changes/unfollows based on observable data; avoid invented identities or causal claims.                                               |

# 5. Functional requirements — competitor analysis and discovery

| **ID**  | **Requirement / expected behavior**                                                                                                                               |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| COMP-01 | Search/discover suitable competitor accounts and assess niche fit: each of the five most recent published posts must relate to skincare.                          |
| COMP-02 | Present accessible competitor profile/post details, captions, content format and public engagement as permitted by actual data access.                            |
| COMP-03 | Compare with the user only on reasonably equivalent measures and periods; explicitly identify incomparable metrics, estimates and unavailable values.             |
| COMP-04 | Generate specific evidence-based interpretations and improvement opportunities; preserve Growy-demonstrated competitor scope as the provider-evaluation baseline. |
| DISC-01 | Combine Hot Topics, Niche Ideas and Idea Swiper into one integrated feature, not independent tabs.                                                                |
| DISC-02 | Derive recommendations from evidence across the user’s history, qualified competitors and relevant current topic sources.                                         |
| DISC-03 | Every idea includes concise rationale, identifiable observations where available, recommended format and relevant uncertainty; do not guarantee success.          |
| DISC-04 | Support touch swiping and accessible alternate controls to save/pass suggestions, discuss with AI and move useful ideas to planning.                              |
| DISC-05 | Distinguish observed topic activity from genuine measured trends and speculative suggestions; swipes express preference, not proof of performance.                |
| NEWS-01 | Provide official Instagram algorithm and Edits updates with source attribution and dates; label inference separately.                                             |

# 6. Functional requirements — Content Planner, publication and notifications

| **ID**   | **Requirement / expected behavior**                                                                                                                         |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PLAN-01  | Content Planner lives within Dashboard and supports bulk organization, daily style/type preferences, drafts, planned dates and format recommendations.      |
| PLAN-02  | Support flow: idea/images → generate/edit → autosaved draft → choose planned date → in-app reminder → final review → user presses Publish.                  |
| PLAN-03  | No unattended scheduled publication, autonomous rescheduling or automatic repeat attempts in initial scope.                                                 |
| PLAN-04  | Publish exactly the current user-approved version only after user action, with protected account authorization and appropriate validation.                  |
| PLAN-05  | Report publish failures and uncertain outcomes; check for already-published content as necessary before any new user-directed attempt.                      |
| PLAN-06  | Preserve drafts automatically, show saving/saved/error states, restore earlier version or discard changes, and recover safely after interruptions.          |
| NOTIF-01 | Display brief in-app corner toast reminders for due posts and relevant unfollow/operational events; toast fades automatically and can be dismissed.         |
| NOTIF-02 | A toast disappearing or being dismissed does not remove an unresolved planned task or publication error; no external push/email reminders in initial scope. |
| NOTIF-03 | A planned post not viewed on its due date remains unpublished; reminder can be shown on the next suitable app session.                                      |

# 7. Functional requirements — authentication and privacy

| **ID**  | **Requirement / expected behavior**                                                                                                                             |
|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AUTH-01 | Authenticate the Trellis user independently of Instagram, using a secure user account.                                                                          |
| AUTH-02 | Allow exactly one linked Instagram account per Trellis user initially; do not hardcode user or Instagram identities.                                            |
| AUTH-03 | Use a supported official authorization process and present the authorized Instagram account identity for explicit user confirmation before completing the link. |
| AUTH-04 | Protect secrets/tokens server-side; enforce authorization and tenant isolation for data, chats, content and Instagram operations.                               |
| AUTH-05 | Allow disconnection/replacement; revoke or invalidate access as supported and halt new collection on disconnect.                                                |
| AUTH-06 | On disconnect, provide a clear, explicit choice to consent to permissible data retention or delete stored Instagram-related data, describing category effects.  |
| AUTH-07 | Keep Trellis-account deletion distinct from Instagram disconnection; deletion and retention behaviors must comply with applicable provider obligations and law. |
| AUTH-08 | No Instagram publication without explicit authorization by the currently authenticated user for that specific post.                                             |

# 8. Non-functional requirements

| **ID**   | **Requirement / expected behavior**                                                                                                                                  |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PERF-01  | Non-AI navigation, chat opening, draft editing, planner interactions and swipes should feel responsive and should not wait on unrelated AI/external operations.      |
| PERF-02  | AI processing may be slower to protect answer completeness, factual grounding and validation; communicate meaningful operation progress.                             |
| PERF-03  | Display available saved Dashboard information promptly while analysis refreshes; show freshness rather than blocking on remote data.                                 |
| REL-01   | Preserve the most recent successfully saved draft and avoid falsely reporting unsaved changes as saved; recover after reload/connectivity disruption where possible. |
| REL-02   | Avoid duplicate publishing on ambiguous responses; make failures visible and maintain accurate publication state.                                                    |
| UX-01    | iPad browser is the primary design/test target; portrait/landscape and touch input supported. All core features remain available on desktop/mobile.                  |
| UX-02    | Swipe features have non-gesture controls; notifications are non-obstructive and temporary.                                                                           |
| SEC-01   | Apply least-privilege external permissions, secure credential storage and per-user authorization checks.                                                             |
| EFF-01   | Minimize unnecessary model tokens, repeat analytics, external requests and background work without sacrificing accuracy.                                             |
| MAINT-01 | Build for one initial user but model separate users, account connections and data ownership; permit provider replacement without needless overengineering.           |
| COST-01  | Use free-tier AI/providers only initially, with no silent paid API failover or charges.                                                                              |

# 9. Verification scenarios (initial acceptance examples)

| **Test**                                                  | **Expected result**                                                                                                                               |
|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| T-01: “Which of my recent posts got the highest views?”   | AI interprets “recent”, selects available comparable views, retrieves data, identifies winner and describes scope; no demand for internal syntax. |
| T-02: Skincare product photo, request for “my experience” | Editable complete draft, accurate media-product association, visible personal-experience placeholder rather than fabricated testimonial.          |
| T-03: Banned phrase occurs in generated caption           | The ready-to-use draft is corrected to exclude active prohibited expression before delivery.                                                      |
| T-04: Competitor with 4 of latest 5 posts skincare        | Not classified as qualifying skincare competitor.                                                                                                 |
| T-05: Swipe idea surfaced                                 | Card gives specific supported reasons, any important uncertainties, save/pass and discussion actions.                                             |
| T-06: Planned post date arrives, user absent              | No publication; content remains pending, reminder shown on suitable subsequent session.                                                           |
| T-07: User reloads browser during caption edit            | Last saved version recoverable and save state accurate.                                                                                           |
| T-08: User disconnects Instagram                          | Access stops and explicit retention/deletion consent choice presented.                                                                            |
| T-09: AI provider fails after retrieval                   | Bounded eligible fallback reuses evidence when possible; no invented completion or paid provider.                                                 |
| T-10: User on iPad portrait and landscape                 | Can use all core features and swipe alternatives without desktop-only restriction.                                                                |

# 10. Requirements conflicts and deferred decisions

| **Topic**                     | **Status / required follow-through**                                                                                                                                                                  |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Automated publishing conflict | PO v1.1 originally specified automatic scheduled publishing. Later explicit user instruction replaces this initially with reminder + final button press. PO baseline change acknowledgement required. |
| Daily refresh conflict        | PO v1.1 said daily audit. Later instruction favors session open/reload plus controlled metric refreshing. Confirm exact audit trigger at baseline review.                                             |
| Data integrations             | Choose official Meta permissions plus additional compliant sources after data-coverage feasibility study, especially Growy competitor reference.                                                      |
| Provider selection            | Select and test free capable model(s), fallback policy and context mechanisms; no model selected here.                                                                                                |
| Security/legal                | Specify retention categories, deletion workflow, token revocation, provider rules and privacy obligations before release.                                                                             |
| Measurement thresholds        | Define acceptable latency, save interval, data freshness bands and success/error criteria by testing with target iPad.                                                                                |
| Presentation                  | Finalize exact navigation names, layouts, notification duration and editor interactions during iPad-first UI design.                                                                                  |
| Operations                    | Decide feasible metric-collection frequency, scheduled jobs and delivery infrastructure later; no deployment choice here.                                                                             |

# 11. Revision 1.1 verification and failure contracts

Every original SRS requirement ID and T-01 through T-10 is retained unchanged in the preceding sections. This revision defines acceptance evidence and missing/error behaviors. Technical infeasibility causes an explicitly tracked blocker and Product Owner decision, never silent deletion of the requirement.

## 11.1 Structured evidence and analytical correctness

For AI-03/04, DATA-02 and COMP-03, each factual measurement used in a response is linked to an observation record with: source/provider, owned/public subject identifier, metric name and unit, comparable time window, original event/observation date when available, last provider check, last changed timestamp, accessibility and definition notes. A missing measurement is Unknown, never converted to zero without evidence.

Numerical rankings, rates, comparisons and aggregations are computed by deterministic Go operations from validated source observations, not by unconstrained language-model arithmetic. The user-facing answer distinguishes Observed, Calculated, Inferred and Unknown. Model tool calls are allowlisted, schema-validated and user-authorized, with no unrestricted SQL, provider tokens or autonomous publishing capability. External content and model messages are data, not instructions granting access or permissions.

An analytical answer must name the metric, subject, period, measurement freshness, evidence scope and major comparability limits. Where requested evidence is unavailable, respond with the supported subset or a clear blocker; do not imply success.

## 11.2 AI intent, free-provider fallback and memory

| SRS IDs | Additional verification rule |
|---|---|
| AI-01/05 | Reasonable harmless defaults may be inferred, but assumptions affecting the metric, time period, content identity or conclusion must be disclosed. Clarify genuinely consequential ambiguity. Long operations show progress; choose bounded waits from measured provider performance before acceptance. |
| AI-02 | Recent messages and selectively retrieved prior conversation history provide context. Cross-chat memory requires explicit user instruction and offers view, correction and removal; chat deletion and retention must follow the finalized data policy. |
| AI-06 | A provider compatibility matrix records tool-calling, image inputs, context size, output schemas, privacy rules and free quotas. Only compatible free providers may be tried, for a configurable bounded number of attempts and elapsed time. Reuse retrieved evidence; if all fail, return an honest error rather than a fictional template answer. |
| AI-07/08 | Validate applicable source/numerical claims and the readiness of generated text. Server-side output checks block ready-to-use content with active banned expressions. AI can propose, but cannot activate restrictions or Publish. |
| CONT-04/08 | Initially, learning style means choosing relevant creator captions for contextual examples; fine-tuning and embeddings are not mandatory. A sparse history produces an editable draft with disclosed limits. User edits inform later suggestions without becoming a permanent banned list. |

Provider timeout, token limits and AI fallback attempts require instrumented tests with real free-tier accounts. Arbitrary numbers from reviews (8-second timeout, five-second total response or zero quota lockouts across 50 trials) are proposed benchmarks, not proven guarantees.

## 11.3 Content safety and creator voice

- **CONT-01/02:** Images may contain several products or ambiguous labels. Do not treat an uncalibrated model confidence score as proof; request product association/confirmation when unclear. Unknown personal usage or opinions remain visible, editable placeholders.
- **CONT-03/07:** The post package has separate structured fields for hook, caption, CTA, hashtags, associated images and unresolved personal-experience placeholders. Before marking content Ready to use, validate the assembled text against every currently active prohibited expression.
- **CONT-06/07 match semantics:** Match user-listed expressions case-insensitively with Unicode and whitespace normalization. Specify word boundaries, punctuation and hashtag handling with examples in the test corpus. Do not auto-ban synonyms or inflections the user has not activated. A failed safe correction is shown as a blocked/unready draft, never reported as validated.
- **CONT-05/09:** Competitor evidence and format recommendations provide rationale without imitating distinctive wording. A strategy suggestion's evidence limitation is explained.
- **CONT-08:** Editing/rejecting an output is a contextual preference signal, not an automatic permanent blacklist entry.

## 11.4 Source refresh and historical coverage

- **DATA-02:** Distinguish source post/event time, value-observed time, last checked time and last changed/updated time. If a provider check retrieves unchanged values, change the check timestamp only.
- **DATA-03/04:** Persist valid observations as collected; never claim uninterrupted history when collection had gaps. Configurable refresh preferences operate only within account permission, provider quota and consent.
- **DATA-05/06/07:** Render saved Dashboard data and its timestamps first. Session open/reload may recompute narrative analysis from unchanged saved evidence without calling external APIs unnecessarily. Periodic raw-metric collection is a separate feasible design option, not a guaranteed daily job.
- **DATA-08:** Aggregate follower changes do not reveal identities or causes absent authorized source evidence. Clearly mark hypotheses.
- **COMP-03:** Comparisons use equivalent units, definitions, periods and access scopes, or state why they cannot be compared.

## 11.5 Competitor qualification, discovery and updates

The exact COMP-01 business rule remains: all **five latest published** accessible posts must be skincare-related. Determine recency using publication time, ignoring pinned display order. One clearly unrelated recent post means Not qualified. Fewer than five verifiable posts or unresolved classification results mean Unknown/Insufficient evidence, never a fabricated fifth post. Retain per-post source IDs and classification rationale. No model may silently relax five-of-five to a percentage of ten.

COMP-02/04, DISC-01/05 and NEWS-01 depend on proven permitted source access. A swipe suggestion carries at least idea, suggested format, rationale, attributable observations, freshness, key uncertainty and saved/passed state. Saved/swiped preference does not prove likely engagement. An official Instagram/Edits update retains publisher, canonical link, published date and retrieval date, with Trellis inference explicitly distinct. On source loss, show an unavailable/stale state rather than invent a topic or news item.

## 11.6 Draft recovery, manual publishing and reminders

- **PLAN-06/REL-01:** Autosave after a documented debounce, field exit or navigation trigger, with an expected version number. Competing edits from two tabs cannot silently overwrite acknowledged work. Show Saving, Saved, Unsaved/error and recoverable last-confirmed version honestly; determine numerical save targets on the real iPad.
- **PLAN-03/04/AUTH-08:** A Publish press by the authenticated owner approves the exact current immutable draft version, validated account and media. A uniquely keyed publication intent deduplicates repeated clicks and client retransmissions. Planned dates and background jobs never issue independent publication authority.
- **PLAN-05/REL-02:** Persist intent and attempt states such as Ready, Submitted, Confirmed, Failed and Unknown. A provider timeout is Unknown, not automatically Failed. Reconciliation is best effort where the provider supports it; never blindly re-issue a potentially duplicate publication. A new attempt requires explicit safe user-directed handling.
- **NOTIF-01/03:** Toast dismissal never resolves a pending reminder or error. Keep unresolved items in an accessible in-app list and surface missed dates on the next suitable session. No external push/email is silently added.

## 11.7 Auth, retention, reliability and cost

- **AUTH-01/04:** Use a vetted account authentication/session design; validate object ownership on every API and AI tool operation, including background jobs, assets and publication intents. Secure cookies, anti-CSRF and session expiration should match the chosen implementation; raw tokens never go to browser storage.
- **AUTH-03/05:** Validate supported OAuth state and any applicable PKCE, then show the specific authorized Instagram identity for confirmation. Disconnect halts new collection and revokes or invalidates credentials as technically supported.
- **AUTH-06/07:** Define a data-category retention/deletion matrix covering tokens, metrics, posts, media, drafts, chats, preferences and audit records. Final behavior must comply with actual platform and legal duties. Display accurate deletion completion/errors; Trellis account deletion differs from Instagram disconnect.
- **EFF/COST:** Use a per-user/provider request budget, rate-limit classification and safe backoff. Only free-tier-compatible fallbacks, never unapproved billable BYOK or silent paid usage.
- **Jobs:** Use atomic job claiming, leases/recovery, attempt tracking and operation-specific retry classifications. Row-level locking does not guarantee exactly-once completion of external side effects. Idempotency and reconciliation are required for risky operations.

## 11.8 Testability and target-setting

Safety invariants have exact negative tests: no publishing without post-version approval; no known active banned phrase in Ready to use outputs; no fabricated observed metrics; no cross-user data access in authorization tests; no background retry of uncertain publishing.

Performance targets are not invented from reviewer examples. Before the relevant sprint acceptance, record target iPad/browser, data fixture, network profile, baseline, percentile definition and agreed thresholds for cached navigation, autosave acknowledgement, refreshing, AI progress and completion.

| Additional case | Scenario | Required observed behavior |
|---|---|---|
| T-11 | Meta unavailable while Dashboard has old snapshots | Saved measurements shown with accurate stale/error and source timestamps; no false refresh. |
| T-12 | Two browser tabs edit the same draft | Version conflict detected; no acknowledged changes silently lost. |
| T-13 | Double-click Publish on one approved draft | Only one logical intent; repeated requests do not automatically duplicate post. |
| T-14 | Provider times out after content submission | State Unknown; reconciliation guidance; no blind repeat. |
| T-15 | Listed phrase appears in capitalization/punctuation/hashtag variants | Match according to approved normalization fixtures before ready-to-use output. |
| T-16 | Competitor has only four of five qualifying posts | Not qualified, with source-backed per-post rationale. |
| T-17 | Fewer than five competitor posts are accessible | Unknown/insufficient evidence, not a pass. |
| T-18 | Primary free model rate-limited and secondary incompatible | Honest failure or qualified supported output; no paid fallback. |
| T-19 | Product photo and identity ambiguous | Creator confirmation or placeholders; no invented review. |
| T-20 | Other user's IDs submitted to API or tool | Authorization denies private data or mutation. |
| T-21 | Instagram disconnected with refresh jobs pending | New collections stop; in-flight jobs follow documented cancellation/consent rule. |
| T-22 | Reminder due while browser closed | No publication; pending reminder appears when next suitable session opens. |

## 11.9 Verification traceability and revision

For each original BR and SRS ID, record a verification artifact: business outcome, API/data contract, reproducible fixture, pass/fail rule, required device/provider access and relevant error cases. Unit, DB integration, provider contract, failure-injection and real-iPad end-to-end layers are complementary; no single coverage percentage substitutes for the critical behaviors above.

**Revision 1.1 (24 October 2026):** Adds test contracts, evidence schema, source-availability behavior, precise competitor classification, autosave/publishing concurrency, security/retention controls and T-11 through T-22. No original Product Owner requirement or existing SRS requirement was deleted. Pending decisions remain explicit.

# 12. Traceability and approval

BRD objective areas map broadly to SRS IDs: analytics BR-01/02 →
DATA/AI; AI BR-03 → AI; content BR-04/05/06 → CONT; planning BR-07/08 →
PLAN/NOTIF; competitors BR-09 → COMP; discovery BR-10 → DISC; updates
BR-11 → NEWS; refresh BR-12 → DATA; accounts BR-13 → AUTH; usability
BR-14 → UX.

Status: revised requirements working baseline, pending review and approval.
It is not a final architecture or proof that third-party APIs can
deliver each requirement.

Product Owner acknowledgement:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_
