# Trellis Sprint 0 Plan: Feasibility, Product Design and Implementation Readiness

**Version:** 0.1  
**Sprint dates:** Monday 26 October to Sunday 1 November 2026 (Asia/Riyadh)  
**Status:** Proposed commitment set; adjust after checking actual daily capacity  
**Participants:** Sole developer / Scrum Master; Product Owner for flow validation and decisions  
**Release link:** Trellis working MVP v0.1 target 31 December 2026

## 1. Sprint goal

**Identify and reduce the blockers that could prevent the first useful Trellis vertical slice, while establishing enough UI/UX design to start implementation without rework.** Sprint 0 is a **one-week timebox**, not a demand to solve every integration or complete the design of the full product.

The development target is an ambitious and broad December MVP, with many capabilities initially experimental. Product Owner requirements and final SRS tests remain preserved in the full backlog. The outcome of Sprint 0 is a set of **evidence-backed decisions, initial designs, prepared tests and Sprint 1 work**, not a finished application.

## 2. Capacity and commitment

Actual work time varies from around **1-2 to 4-5 hours per day**. Do not assume full-time capacity or allocate every available hour. Start with **approximately 14-16 hours of essential work** and consider up to **5-7 further hours** if available. These are timeboxes, **not estimates for completing entire research domains**.

| Tier | Item | Max planned time | Concrete output | ID linkage |
|---|---|---:|---|---|
| Essential | Scope, feature flows and sitemap | 2 h | User-journey list and provisional three-section navigation; PO questions | EP-01-09, US-060 |
| Essential | Own-account Instagram feasibility | 3 h | Tested permitted path or documented unknown/blocked status; field availability sheet | SPK-01; US-002, US-003, US-008 |
| Essential | Free AI grounding and image path | 2.5 h | Tiny natural-query + structured-generation benchmark, limits and failure log | SPK-03; US-017, US-019, US-027 |
| Essential | Identity/privacy reconnaissance | 1.5 h | Identity/token approach, minimal threat and deletion questions | SPK-07; US-001, US-064 |
| Essential | iPad design and responsive feasibility | 2 h | Physical device/browser matrix or access blocker; interaction issues | SPK-06; US-060, US-061 |
| Essential | Low-fidelity wireframes | 2.5 h | Core Dashboard, Chat, post editor, planner and discovery flows; screen states | UX-01, EP-02-07 |
| Essential | Review and Sprint 1 readiness | 1.5 h | Spike evidence, updated risks, Ready candidates, PO feedback, hours log | All |
| **Essential total** | | **15 h** | | |
| Stretch | Competitor source permissions and five-post evidence | 2 h | Legal access notes and representative five-post availability; no invented pass | SPK-02; US-045, US-046 |
| Stretch | Topics and official Instagram/Edits sources | 1.5 h | Small dated source catalogue and first possible discovery card | SPK-04; US-050, US-057 |
| Stretch | Manual publication capability reconnaissance | 2 h | Account/media eligibility and safety/unknown-outcome questions; no unapproved post | SPK-05; US-040-042 |
| **Stretch total** | | **5.5 h** | | |

If only 8-10 hours are available, prioritize **SPK-01, SPK-03, initial sitemap/wireframes and the Sprint 1 readiness decision**. Record the rest as open. If more time becomes available, complete stretch spikes and deepen tests rather than add unnecessary documents.

## 3. UI/UX design is part of Sprint 0

Architecture v0.2 addresses technical structure. Product/interaction design needs additional artifacts:

### 3.1 Journey inventory

Map each flow from user goal through outcome and failure:

1. **Connect:** sign in -> authorize Instagram -> verify correct handle -> accept connection -> see missing/expired permission state.
2. **Audit:** open Dashboard -> inspect profile/post metrics -> compare posts -> request refresh -> understand last-observed/updated status.
3. **Ask:** ask natural-language analytics question -> view evidence and response -> clarify uncertain assumptions -> recover from rate limit/failure.
4. **Create:** upload/select image -> identify products -> generate hook/caption/CTA/hashtags -> validate banned phrases -> edit/save draft.
5. **Plan:** choose a content day/type -> move and edit draft -> save -> see reminder; planner does not grant publish permission.
6. **Discover:** view sourced Hot Topics/niche idea -> save/pass by swipe or button -> discuss with AI or move to planner.
7. **Compare:** choose potential competitor -> inspect 5 most recent published posts -> qualify only if 5/5 skincare -> compare supportable metrics.
8. **Learn:** inspect official Instagram and Edits update with date/source; distinguish announcement from Trellis interpretation.
9. **Publish (subject to permission):** review immutable draft -> explicitly approve Publish -> see confirmed/failed/unknown status without blind retry.

**Sprint 0 sketch target:** a navigation/site map plus low-fidelity screens for onboarding, Dashboard, Chat, content editor, planner and discovery. Competitor/updates/publishing can initially be annotated flow sketches. Confirm the PO's three major navigation destinations and Chat placement; do not invent a fourth top-level section. Record the missing decision if PO unavailable.

### 3.2 UI state checklist for every later screen

Design states before coding: first use/empty, loading, success, missing permission, stale data, quota failure, backend failure, saved draft, unsaved changes, and uncertain publish result where relevant. The iPad portrait/landscape layouts must preserve access to major actions; swiper interactions need button alternatives. Slate/teal visual tokens and clickable prototypes are Sprint 1 tasks, not prerequisites for Sprint 0 completion.

### 3.3 Design acceptance in Sprint 0

- A new creator's first useful path can be traced through the wireframes without hidden decisions.
- The planner remains **inside Dashboard** and does not imply unattended publishing.
- Hot Topics, saved ideas, competitor qualification and Chat entry points are visible within the planned navigation.
- Every source-dependent screen has a truthful **unavailable/unknown** representation.
- Product Owner can approve or comment on navigation and a core end-to-end flow before Angular shell implementation.

## 4. Feasibility experiment protocol

For each SPK-01 through SPK-07, record:

`ID | date | hypothesis | permitted test account/source | exact attempt | sample/request fixture (redacted) | Pass/Fail/Unknown | observed limits | affected US/BR/SRS IDs | decision or next experiment`

Evidence rules:

- **Pass** only when the specific tested claim is supported by an actual permitted result.
- **Fail** when a conclusive limitation was demonstrated, with scope specified.
- **Unknown** when credentials, permissions, official documents, physical device or time were insufficient. A research article or hypothetical result is not an API pass.
- Never use unauthorised scraping, unexplained third-party access, real publishing without explicit consent, or billable AI fallback. Use redacted responses and fixture labels.
- Preserve the **5 of 5 most-recently-published skincare-posts** competitor rule exactly. Missing evidence means `Unknown`, not a relaxed threshold.

### Critical gate A: own-account data (SPK-01)

Check official account type, authorization eligibility, available profile/media/insight fields, access expiry and source freshness. The key deliverable is a **field-by-field actual/unknown matrix**, not a promise to retrieve every requested metric.

### Critical gate B: free AI (SPK-03)

Test at least one normal-language question against small controlled post data where a deterministic answer is known; one structured draft-generation prompt (image input only if the candidate truly supports it); record rate limits/errors and safe fallback eligibility. The evaluation should distinguish *response quality* from *proof of calculation*.

### Critical gate C: interaction fit and identity (SPK-06/07)

Record real iPad model/browser if available, otherwise label the physical-device verification outstanding. Determine an initial safe session/token boundary and private-media model; do not expose IG/AI secrets to the browser. Map disconnect/deletion open questions.

### Stretch gates (SPK-02/04/05)

Timebox each and save even partial evidence for later; do not defer competitor, topic or publishing requirements off the product roadmap. Publication test requires suitably authorized test account and an explicit go/no-go; no automated side effect may be exercised simply to meet the spike.

## 5. First implementation slice to refine at Sprint 0 review

Proposed **Sprint 1** goal: *A creator can reach a protected Trellis Dashboard through the new responsive shell and see a correctly identified, source-labelled own-account profile/post snapshot (live only if authorized capability is proven), with missing-permission states and secured backend boundaries.*

| Candidate | Existing backlog IDs | Dependency / Ready condition |
|---|---|---|
| Go API skeleton and typed errors | EN-01 | Interface and source/AI contracts agreed at initial level |
| Responsive Angular shell and navigation | EN-02, US-060 | PO confirms navigation/site map; iPad baseline assessed |
| Postgres user ownership model | EN-03, US-064 | SPK-07 identity/retention boundary sufficiently clear |
| Login and IG account linkage | US-001, US-002, US-003 | SPK-01 authorization/account eligibility established |
| Basic Dashboard profile and measured data | US-008, US-010 | Actual permitted fields or honestly labelled fixture mode |
| Contract test fixtures and lightweight tests | EN-06, EN-07 | Authorized sanitized samples, agreed expected values |

**Not a hard commitment:** The solo developer must size and select only a feasible subset during Sprint 1 planning. Others remain Ready or Blocked. Shared infrastructure should be just enough for that vertical slice.

## 6. Test-first preparation

Before Sprint 1 coding, define small deterministic fixtures and expected outcomes for these behaviours:

| Scenario | Minimum expected result |
|---|---|
| Invalid/missing authentication | Private profile/media and API data are denied. |
| Wrong or cancelled IG link | No account attached; user sees honest status. |
| Missing IG metric | Display `Unavailable`, never `0` unless measured zero. |
| Same posts with known view counts | Deterministic rank matches fixture; Chat must not override it with invented numbers. |
| Rate-limited free model | User sees recoverable failure/allowed fallback only; no paid request. |
| Active prohibited expression | Generated draft cannot claim ready-to-use status until corrected. |
| Swipe vs button | Same saved/pass preference state. |
| Candidate with 4/5 skincare posts | Fails competitor qualification; missing fifth observation is Unknown. |
| Draft without explicit approval | No outbound publication action. |

These fixtures inform later SRS test-case mapping and are not a claim that all scenarios will be implemented during Sprint 0.

## 7. Calendar guidance (flexible, not daily attendance requirements)

| Window | Suggested focus | Rule |
|---|---|---|
| 26-27 Oct | PO flow priorities; sitemap; SPK-01 | Prioritize external dependency proof before speculative field modelling. |
| 28-29 Oct | SPK-03; SPK-07; first wireframes | Keep each experiment constrained to an answerable hypothesis. |
| 30-31 Oct | SPK-06; responsive/interaction designs; stretch spikes if possible | Check browser/device reality and visible unavailable states. |
| 1 Nov | Review, risk updates, PO validation, Sprint 1 candidate sizing | Do not convert an `Unknown` to `Pass` to start coding. |

Developer can redistribute hours freely. Reprioritize by **dependency risk and user value**, not by the order of days in this table.

## 8. Sprint 0 exit, review and carry-forward

Sprint 0 can conclude successfully even when some external feasibility remains Unknown if:

1. Each *attempted* spike has reproducible status/evidence; untouched spikes remain clearly open and assigned to next evaluation window.
2. There is a reviewed navigation map and minimum core wireframe set, or an explicit PO review action if PO unavailable.
3. Critical risky assumptions are ranked and linked to affected requirements/stories without rewriting the PO's requirement.
4. We have a source-aware, security-aware Sprint 1 vertical-slice candidate and estimated tasks aligned to actual capacity.
5. The first set of tests/fixtures and design-state checklist are ready to be completed before related code.
6. The 31 December target and broad MVP intent remain visible; January carry-forward is explicit rather than silently omitted.

**Sprint review agenda:** (a) hours actually available; (b) demo of evidence and wireframes; (c) Pass/Fail/Unknown spikes and blocked dependencies; (d) Product Owner navigation/feature feedback; (e) Sprint 1 proposed commitment; (f) roadmap confidence and updates.

**Decision needed from Product Owner:** approve navigation/flow placement and priority of the first end-to-end slice. The final full-product scope does not require re-approval simply because release maturity differs from the final SRS.
