# Trellis System Architecture and Design Baseline

Version 0.2 | 24 October 2026 | Status: Proposed for Product Owner and Technical Lead review

Source baselines: Trellis BRD v1.1 and SRS v1.1, revised on 24 October 2026 from the 22 October v1.0 working documents. This architecture retains all required product capabilities and explicitly distinguishes architectural proposals from validated external feasibility. The Claude and Gemini reviews informed verification mechanisms, not scope changes.

## 1. Executive decision

**Proposed style:** an iPad-first Angular/TypeScript browser application communicating over authenticated HTTPS with a modular Go backend. PostgreSQL is the transactional and historical system of record. Private media bytes sit behind a storage interface. Go components use bounded external adapters for official Instagram, permitted competitor/topic/news sources and compatible free-tier AI models. A PostgreSQL-backed job processor handles safe asynchronous work.

This is a modular monolith, not an instruction to deploy microservices. Its initial goal is one creator, while user ownership and per-user authorization remain explicit for future independent accounts. No deployment vendor, paid service, vector database, queue broker or hosting bill is selected here.

**Hard safety boundaries:**

1. Planned dates never authorize unattended publishing. An authenticated user must approve the exact draft version and press Publish.
2. AI may analyze data and generate content but may not activate prohibited-language changes, bypass ownership, or publish.
3. Facts and calculations derive from authorized, source-linked observations. Unknown data is not zero or fabricated.
4. Free AI fallbacks are capability-checked and bounded; no silent paid model usage.
5. Requirements blocked by external constraints remain documented until the Product Owner authorizes a change.

## 2. System context and containers

~~~mermaid
flowchart TB
    Creator["Creator on iPad, desktop or mobile browser"] --> UI["Angular responsive application"]
    UI --> API["Go HTTP API and secure sessions"]
    subgraph Go["Go modular monolith"]
        API --> Modules["Domain and application modules"]
        Modules <--> Jobs["Durable job worker"]
        Modules --> Adapters["Bounded provider adapters"]
    end
    Modules <--> DB[("PostgreSQL")]
    Modules <--> Media[("Private media repository")]
    Adapters --> Meta["Official Instagram platform"]
    Adapters --> Models["Compatible free AI models"]
    Adapters --> Sources["Permitted official and topic sources"]
~~~

Trust boundaries: the browser does not receive provider secrets or direct database access. Go authenticates, authorizes, validates and audits. External provider data and generated model text are untrusted inputs. Optional workers use the same authorization and domain policies as synchronous requests.

## 3. Module boundaries and interfaces

| Module | Primary responsibility | Public operation / boundary |
|---|---|---|
| Identity and Access | Trellis sessions, ownership, consent and account deletion | AuthenticatedUser, AuthorizeResource, RevokeSession |
| Instagram Connection | Supported official authorization, identity confirmation, token lifecycle, disconnect | Connect, ConfirmIdentity, GetConnectionCapabilities, Disconnect |
| Analytics and History | Profile/post observations, freshness, comparisons and Dashboard opportunities | GetDashboard, RefreshMetrics, ComparePosts, ExplainCoverage |
| AI Orchestration | Intent, bounded context, read-only tools, evidence, schema checks, free-model fallback | AnswerQuestion, GenerateDraft, ValidateOutput |
| Content and Creator Voice | Media association, editable packages, caption context, user bans and saved versions | CreateDraft, SaveVersion, RestoreVersion, ValidateLanguage |
| Planner and Publication | Planned dates, reminders, immutable approved versions, publish attempts | PlanPost, ApproveVersion, Publish, ReconcileOutcome |
| Competitor and Discovery | Five-latest-post qualification, fair comparisons, source-backed swiper ideas | EvaluateCompetitor, GenerateIdeas, RecordSwipe |
| Official Updates | Attributed Instagram algorithm and Meta Edits updates | ListOfficialUpdates, GetSourceEvidence |
| Jobs and Integration Adapters | Durable operations, Meta/AI/source interfaces, rate limits and normalizers | EnqueueJob, ClaimJob, ProviderCapabilities |

Go packages should protect internal domain boundaries rather than importing another module's persistence implementation. A domain module owns business rules; integrations translate provider DTOs to internal models with provenance. Interfaces support hand-written fakes and provider contract tests. A mock-generation library is optional, not mandated.

## 4. Canonical data and ownership

PostgreSQL entities are conceptual, not finished migrations:

| Domain | Proposed records |
|---|---|
| Identity | users, sessions, instagram_connections, oauth_states, consent_choices, encrypted_credentials |
| Analytics | instagram_posts, account_observations, media_metric_observations, analysis_snapshots, refresh_jobs |
| AI | conversations, messages, approved_memories, model_invocations, evidence_links |
| Creator content | media_assets, drafts, draft_versions, prohibited_expressions, style_examples |
| Planning and publishing | planner_entries, reminders, publish_intents, publish_attempts, provider_publications |
| Competitors | competitor_accounts, competitor_posts, classification_evidence, competitor_reviews |
| Discovery/news | idea_cards, idea_actions, official_source_items, topic_observations |
| Operations | background_jobs, integration_errors, audit_events, deletion_jobs |

Private records include user_id or reference an owning record checked at every access. External identifiers include provider and account scope; they are not primary ownership authority. SQL migrations, uniqueness constraints and foreign keys should establish invariant relationships.

Measurement record fields include source/provider, subject, metric name/unit, value or unavailable flag, metric period, observed_at, checked_at, changed_at and provider version/definition where meaningful. Comparisons explicitly check compatible metric meanings and date windows. Historical coverage reports gaps without pretending continual collection.

Private media is accessed via an interface supporting local development storage and a later durable storage backend. Signed/authorized access, content-type/size validation, retention and backups are part of its contract. The architecture does not preselect billable S3/R2 or another vendor.

### 4.1 Key lifecycle relationships

~~~mermaid
erDiagram
    USER ||--o{ INSTAGRAM_CONNECTION : owns
    USER ||--o{ CONVERSATION : starts
    CONVERSATION ||--o{ MESSAGE : contains
    USER ||--o{ DRAFT : owns
    DRAFT ||--o{ DRAFT_VERSION : preserves
    DRAFT_VERSION ||--o{ PUBLISH_INTENT : approved_for
    INSTAGRAM_CONNECTION ||--o{ INSTAGRAM_POST : supplies
    INSTAGRAM_POST ||--o{ METRIC_OBSERVATION : measured_by
~~~

## 5. Refresh, history and Dashboard

The analysis-refresh trigger and metric-collection trigger are distinct:

1. Angular requests Dashboard. Go serves the most recent available observations and analysis with explicit freshness and source coverage.
2. On session open/reload or user request, Go checks whether an existing analysis remains valid; if not, it may compute a new analysis from stored measurements.
3. A metric refresh runs only under an approved preference/policy and provider eligibility. It checks quota, consent, connection state and an already-active job before enqueueing.
4. Worker retrieves supported measurements, stores/upserts observations and timestamps, then invalidates affected analysis caches.
5. The UI communicates Checked with no data change separately from Updated measurements, Stale, Rate limited and Failed.

Periodic historical sampling may be needed for comparative value, but daily cron is **not** accepted as an unconditional requirement. Feasibility must establish permitted sample frequency, quota, runtime/deployment needs and user-selected refresh policy. Without collection, the application must disclose historical gaps.

## 6. AI reasoning, evidence and fallback

The model never receives unrestricted SQL or raw provider credentials. Allowed Go tools return typed records and deterministic results. A compact context builder uses recent conversation turns, selectively retrieved older conversation turns, relevant creator captions and explicitly user-approved cross-chat memories. User actions can view, correct or delete such memories.

Every analytical answer has a structured internal envelope: question and resolved scope, source-linked observations, deterministic calculations, known assumptions, missing evidence, inference and user-facing explanation. The response distinguishes observed values from model interpretation and renders verified numerical values from server-calculated fields.

Provider router checks free quota and capability for image input, tool use, context length and structured output. On eligible rate limits/outages it reuses evidence for a bounded compatible fallback. No compatible free model means a clear failure and preserved conversation state; there is no billable BYOK failover or false success. Configure retry/time budgets from measured results instead of assigning arbitrary eight-second timers.

For image-led drafting: validate image associations, retrieve selected relevant creator captions, generate structured hook/caption/CTA/hashtags, require placeholders for unknown first-person experiences, and enforce active prohibited expressions before labeling the output Ready to use. A model's self-reported confidence is not treated as calibrated; ambiguous product identity is confirmed by the creator.

Server-side prohibited-expression validation is deterministic. Normalize case/Unicode/whitespace, define punctuation/hashtag boundary examples, respect exactly the creator's active list, and do not silently expand it to unrelated words. Failed validation leaves an editable unready draft rather than leaking a ready-to-use violation.

Vector search such as pgvector is an **optional future optimization** after measuring retrieval relevance and scale. Initial SQL filtering, full-text search and curated caption selection may suffice.

## 7. Draft editing, autosave and recovery

Drafts are versioned. Angular sends edits with an expected version. The backend uses a transaction/optimistic concurrency check to save a new version or return a conflict. It acknowledges Saved only after durable persistence; UI distinguishes pending, saved and failed state. A reload restores the last confirmed version. Two tabs cannot silently overwrite newer acknowledged changes. Autosave debounce and measured p95 targets are decided from physical iPad tests rather than arbitrary constants.

Personal experience placeholders and product-image associations remain editable fields. Content generation and planner operations never implicitly approve publication.

## 8. Manual publication lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Ready
    Ready --> ApprovedSnapshot
    ApprovedSnapshot --> Submitting
    Submitting --> Confirmed
    Submitting --> Failed
    Submitting --> Unknown
    Unknown --> Reconciliation
    Reconciliation --> Confirmed
    Reconciliation --> Failed
~~~

An authenticated user reviews the **current exact version** and presses Publish. Go validates ownership, Instagram connection, media type/format, active restrictions and an immutable approved-version reference. The database transaction creates a unique publication intent and idempotency key before an outbound request. Duplicate clicks return the existing logical intent.

A provider timeout produces Unknown. Reconciliation may consult supported provider evidence, but a missing response may leave genuinely unresolved status. Do not claim a GET by unknown media ID is always possible; do not blindly retry a potentially successful post. Any safe reattempt requires documented reapproval/reconciliation policy. No background job automatically publishes a due post.

This is not a distributed two-phase commit across PostgreSQL and Meta. The design combines local transactional persistence, idempotency, a state machine and best-effort reconciliation.

## 9. Competitors, topics and updates

The original Product Owner rule is retained: to qualify, **all five latest published posts** must be skincare-related. Sort by publication time, not pinned profile arrangement. Four-of-five fails. Fewer than five accessible records or unresolved classification means Unknown/insufficient evidence. Store source references and the per-post rationale. Neither a seventy-percent-of-ten rule nor an embedding similarity threshold is silently substituted.

The competitor provider exposes capabilities and normalized accessible public records. Do not assume all engagement or follower measures exist or that public web parsing is permitted. A failed official-data spike blocks the integration until an approved alternative is reviewed.

The combined Hot Topics/Niche Ideas/Swiper uses source-backed observations, reasoned opportunities, format and uncertainty rather than guaranteed trends. Save/pass events persist preferences without being treated as proven performance outcomes. Official Instagram/Edits updates keep publisher, URL, publication and retrieval dates; label Trellis interpretation distinctly.

## 10. HTTP contracts and error behavior

Illustrative API surface, not a committed URL schema:

| Operation | Illustrative method/path | Important behavior |
|---|---|---|
| Saved Dashboard | GET /api/v1/dashboard | Returns snapshots, source timestamps, coverage and analysis freshness |
| Explicit refresh | POST /api/v1/refreshes | Deduplicates eligible work; returns job/status |
| Chat message | POST /api/v1/conversations/{id}/messages | Authenticated, bounded AI processing and progressive feedback |
| Draft save | PATCH /api/v1/drafts/{id} | Requires expected version; reports conflict/acknowledgment |
| Planner entry | POST /api/v1/planner | Stores dates/reminders only; cannot authorize publishing |
| Publication intent | POST /api/v1/publish-intents | Requires explicit approved current version; idempotent logical intent |
| Notifications | GET /api/v1/notifications | Pending reminders/errors persist after toast dismissal |
| Disconnect | POST /api/v1/instagram/disconnect | Stops collection and starts explicit retention/deletion choice |

All protected operations use server-authoritative user identity and authorization. Use structured problems/error codes (unauthenticated, unauthorized, validation failure, missing evidence, rate limited, stale source, version conflict, provider unknown and internal failure), request IDs and safe log redaction. A stale value must not be called freshly retrieved.

## 11. Durable jobs and concurrency

A PostgreSQL-backed queue is sufficient initially. A job record carries type, owner, status, attempts, lease owner/expiration, scheduled availability, idempotency key and last error. Workers claim eligible rows in a short transaction using a pattern such as SELECT ... FOR UPDATE SKIP LOCKED, record a lease, and perform external work outside the transaction.

SKIP LOCKED reduces worker contention; it does **not** guarantee exactly-once external execution. After crashes and lease expiry, some safe jobs may repeat. Use at-least-once processing with idempotent/upsert behavior for data refresh, bounded retries and explicit reconciliation for side effects. Never assign automatic content publication to a generic retry policy.

Do not add Redis, Kafka, separate microservices or Kubernetes without measured need.

## 12. Authentication, privacy and security

Trellis authentication is distinct from the Instagram connection. Select a vetted session/identity solution after a security spike; custom JWT sessions are not mandatory. Evaluate secure HttpOnly/SameSite cookies, CSRF, session expiry, credential rotation and authorization tests. OAuth callbacks validate state and other applicable protections, and the user explicitly confirms the Instagram identity before connection completion.

Encrypt stored provider tokens at rest with appropriately managed secrets/keys; tokens never appear in browser-readable storage, AI tool inputs or logs. Validate file upload types/sizes, output escaping, per-user rate limits and provider least privilege. Every data, draft, job, source-derived private record and publishing action enforces owner scope.

Disconnect immediately blocks new collection; background work checks current authorization before external access. Revoke/invalidate permissions as supported. Retention and deletion behavior must be a lawful, explicit matrix by data category; Trellis account deletion is separate from Instagram disconnect. Never claim removal before operations succeed.

## 13. Reliability, observability and performance

Serve cached non-AI UI responses while remote work proceeds; long AI tasks show meaningful progress. Log request/job IDs, operation duration, freshness and source coverage, model/provider outcomes, fallback attempts, autosave conflicts and publishing states without secrets. Keep a small audit trail of consent, connection changes, banned-list edits and user publication approval.

Test failure conditions: remote quota/outage, stale snapshots, model incompatibility, duplicate clicks, interrupted browser session, two-tab editing, network timeout after publishing, disconnect mid-refresh and cross-user requests.

Performance is measured on the nominated iPad/Safari and realistic test network. Before sprint acceptance set p95 targets for navigation, autosave acknowledgment, saved Dashboard rendering, AI progress and AI completion. Do not adopt unmeasured fixed values as contractual SLAs. Critical safety invariants receive exact negative tests and ongoing monitoring.

## 14. External feasibility gates

| Gate | Proof before implementation commitment | Scope-preserving failure behavior |
|---|---|---|
| FG-01 Own Instagram data | Account eligibility, authorized identity, available insights/history, quotas and token lifecycle | Explain unavailable fields and create an explicit requirements blocker |
| FG-02 Competitor data | Permitted discovery, five-post retrieval, source record coverage and fair comparison fields | Preserve five-of-five rule, mark unverified, ask PO before alternate data workflow |
| FG-03 News and topics | Official source attribution, permitted current-topic observations and dates | Show unavailable/stale source and record need for alternative |
| FG-04 Free AI | Image + tool use, structured outputs, privacy constraints, quota and compatible fallback | Fail honestly; never charge or silently reduce scope |
| FG-05 Publication | Approved permissions, media workflow, idempotency and outcome handling | Disable unsafe publish action and record blocker |
| FG-06 Target device | iPad portrait/landscape, touch alternatives, autosave interruption and accessibility | Fix design, retain equivalent core functions elsewhere |

These are engineering experiments to establish availability, not a mandate for every user-feature acceptance threshold to pass in two weeks. A feature can remain Required while Pending feasibility. Technical Lead captures evidence; Product Owner approves any substantive change in product behavior.

## 15. Architecture decisions

| ADR | Proposed choice | State |
|---|---|---|
| ADR-001 | Angular UI with modular Go monolith | Proposed |
| ADR-002 | PostgreSQL as primary transactional/historical store | Proposed |
| ADR-003 | PostgreSQL-backed durable jobs with safe concurrency and idempotency | Proposed, mechanics refined |
| ADR-004 | Capability-aware Instagram, free AI, topics/news adapters | Proposed |
| ADR-005 | Deterministic measurements with evidence lineage | Proposed |
| ADR-006 | Immutable user-approved publishing version and uncertain-state recovery | Proposed |
| ADR-007 | Conversation context; explicit cross-chat memory permission | Proposed |
| ADR-008 | Private media repository interface, vendor deferred | Proposed |
| ADR-009 | Typed AI output and validation contract; no unrestricted model tools | Proposed |
| ADR-010 | Versioned drafts with optimistic concurrency | Proposed |
| ADR-011 | Periodic raw-metric collection remains a feasibility-based policy choice | Proposed |
| ADR-012 | Vendor, authentication and deployment choices deferred until measured/approved | Proposed |

## 16. Requirements traceability and verification

| Source IDs | Architecture control | Required verification |
|---|---|---|
| BR-01/02/12, DATA, AI-03/04 | Observation schema, deterministic analytics, freshness and refresh policy | T-01, T-11, source fixtures, comparability tests |
| BR-03/04/05/06, AI, CONT | Authorized tools, structured output, context/voice, ban and product checks | T-02/03, T-15/18/19, AI benchmark cases |
| BR-07/08, PLAN, NOTIF | Versioned autosave, planner reminders, guarded publish states | T-06/07, T-12/13/14/22 |
| BR-09, COMP | Exactly five latest published posts and proof of skincare fit | T-04, T-16/17 |
| BR-10/11, DISC, NEWS | Evidence-backed swiper and official attributed updates | T-05, source provenance contract tests |
| BR-13, AUTH, SEC | OAuth confirmation, user isolation, disconnect and retention policy | T-08, T-20/21 |
| BR-14, UX, PERF | iPad-first responsive app with all core actions | T-10, physical device and accessible alternative tests |
| AI-06, COST/REL | Compatible free fallback and honest failure | T-09, T-18, provider fault injection |

Complete BR-to-SRS-to-architecture-to-test traceability remains a maintained implementation artifact; this table identifies the baseline linkage.

## 17. Work sequencing and unresolved decisions

Suggested engineering order: confirm PO baseline changes and requirement identifiers; validate the official account/data and free AI capabilities; establish source and competitor coverage; implement owner-aware persistence and a narrow Dashboard data path; add grounded Chat; implement draft recovery and manual publishing with failure tests; then complete Topics, competitors, official updates, notification and cross-device verification. This sequencing does not remove later-slice requirements.

Open decisions for named approval: navigation allocation in the PO baseline, precise refresh/snapshot intervals, supported IG account capability, legal retention rules, identity implementation, media storage provider, free AI model list and fallback budgets, measurable performance targets, and eventual deployment operation.

**Revision record:** v0.2 (24 October 2026) preserves v0.1 architectural intent and all eight existing ADRs, while adding explicit implementation/error contracts, concurrency and ownership invariants, SRS test mapping, safety safeguards, feasibility gates and three new decision areas. Status remains Proposed; no unverified external integration or Product Owner requirement change is represented as approved.
