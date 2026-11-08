# Trellis Business Requirements Document

Version 1.1 | 24 October 2026 | Status: revised working baseline pending Product Owner approval

# 1. Purpose and authority

Trellis is an AI-assisted Instagram growth, analysis and
content-planning web application intended initially for one
skincare/K-beauty creator, with a future possibility of
commercialization. The Product Owner is the initial user; the project
lead serves as Scrum Master and technical decision maker. This BRD
captures product needs, not an implementation plan.

Source baseline: Trellis Product Owner Feature Requirements v1.1 (22
October 2026), supplemented by subsequent decisions from the
requirements discussion. When a later explicit decision changes the
earlier summary, it is recorded under Change Control rather than
presented as if it had appeared in the PO summary.

# 2. Business objectives

- Reduce the time and effort required to interpret Instagram performance
  and plan useful skincare content.

- Provide evidence-based, personalized guidance instead of generic or
  overly literal AI responses.

- Produce natural, authentic writing that matches the creator’s voice
  and gives the creator editorial control.

- Make planning and content discovery practical on the iPad, the primary
  device.

- Preserve user trust through transparent data limitations, explicit
  publication approval and account security.

- Enable a path toward multiple independent customers without hardcoding
  the initial account.

# 3. Stakeholders and scope

| **Role**                        | **Responsibility**                                                                           |
|---------------------------------|----------------------------------------------------------------------------------------------|
| Product Owner / initial creator | Defines desired outcomes, reviews features and approves content and restrictions.            |
| Scrum Master / technical lead   | Organizes delivery and technical decisions.                                                  |
| Trellis end user (future)       | Owns application data, account connection, writing preferences and final publishing actions. |

## In scope — initial product

- Responsive browser application, iPad-first, with equivalent core
  functions on mobile and desktop.

- Dashboard auditing, analytics, historical comparisons, opportunities
  and in-Dashboard Content Planner.

- AI Chat for contextual analysis and image-led caption/content
  generation.

- Skincare competitor identification and comparative analysis.

- Combined Hot Topics + Niche Ideas + swipe discovery with
  evidence-based explanations.

- Official Instagram algorithm and Meta Edits updates.

- Account sign-in, explicit connection confirmation, secure data
  handling and consent-based retention.

- User-reviewed, one-click publishing initiated by the user; in-app
  reminders for planned posts.

## Deferred / excluded from initial delivery

- Unattended scheduled Instagram publishing, automatic retries or
  rescheduling after failure.

- Native mobile applications and device-specific feature restrictions.

- More than one connected Instagram account per Trellis user.

- Paid AI models or paid API usage under the current free-only
  constraint.

- Separate My Brand feature, automated guarantee of trend success,
  invented performance forecasts.

- Hosting/deployment choices and advanced enterprise-scale
  infrastructure.

# 4. Business requirements

| **ID** | **Business requirement**                                                                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| BR-01  | Users can audit Instagram profile, bio, posts, audience and performance, with actionable opportunities.                                                           |
| BR-02  | Users can compare current performance with historical periods and investigate follower changes without speculative claims stated as fact.                         |
| BR-03  | An AI assistant understands natural-language requests, selects relevant evidence and produces personalized, grounded answers.                                     |
| BR-04  | Users can create image-informed hooks, captions, calls to action and hashtags in an editable fill-in-the-blanks workflow.                                         |
| BR-05  | Generated text reflects past user captions and experience; competitor material informs strategy rather than imitating another creator’s voice.                    |
| BR-06  | Users govern a hard prohibited-language list; AI suggests changes but cannot activate them without approval.                                                      |
| BR-07  | Users organize multiple draft ideas, daily content choices and content formats in a planner embedded in Dashboard.                                                |
| BR-08  | Users set intended posting dates, receive an in-app reminder and explicitly approve/press Publish for each post.                                                  |
| BR-09  | Users assess relevant skincare competitors; all five latest posts must be skincare-related to qualify.                                                            |
| BR-10  | Users explore one combined Hot Topics/Niche Ideas/Swiper experience: evidence-backed idea, rationale, suggested format, uncertainty, save/pass and AI discussion. |
| BR-11  | Users receive identifiable official Instagram algorithm and Edits news, distinguished from the assistant’s inference.                                             |
| BR-12  | Users select Instagram-data refresh preferences, manually refresh, and understand measurement freshness.                                                          |
| BR-13  | Users connect the correct Instagram account by explicit account confirmation and control disconnect/retention consent.                                            |
| BR-14  | The core workflow is usable on iPad first, with full functionality on desktop and mobile browsers.                                                                |

# 5. Business rules and trust principles

- Historical account information should be preserved where available,
  but older posts should receive relevance weighting based on the
  question, not arbitrary exclusion.

- Competitor comparison should use comparable accessible measures;
  missing public or private measurements cannot be invented.

- A content recommendation must include why it is relevant and the
  supporting observations, without promising performance.

- User-specified prohibited phrases are strict generation restrictions
  until the user removes them; other acceptable language remains
  available.

- Planned dates and reminders do not constitute permission for
  unattended posting. Publishing requires an explicit user action for
  that particular post.

- Each account connection requires authorization through a supported
  mechanism and explicit confirmation of the Instagram identity.

- Disconnecting stops access; the user expressly chooses whether
  permissible stored Instagram-related data is retained or deleted.

- Notification pop-ups are brief and dismiss automatically; dismissing a
  toast does not erase the underlying unresolved task/event.

# 6. Success criteria — qualitative baseline

- The user can ask ordinary questions like “Which of my recent posts has
  the highest views?” without knowing field names or required command
  syntax.

- The user can revise suggested captions without invented skincare
  experiences, robotic repetitive language or forbidden phrases.

- Every recommended swipe idea communicates its rationale and
  limitations.

- No content is published merely because a planned date arrived.

- Previously saved drafts can be recovered after session interruption,
  and the interface does not feel stalled during AI processing.

Quantitative acceptance thresholds (latency, refresh intervals,
completeness, accuracy and availability) remain to be determined during
validation and testing; these qualitative statements must be converted
into test cases in the SRS and test plan.

# 7. Changes relative to PO summary v1.1

| **Earlier PO summary**             | **Latest requirement decision / status**                                                                                                                     |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Daily audit refresh                | Dashboard analysis on session start/reload or explicit request; source metric refresh configurable by user. Supersedes default unconditional daily analysis. |
| Schedule and automatically publish | Planned date + in-app reminder + final manual approval/Publish. Automated unattended publishing deferred.                                                    |
| Ask for relevant experience        | AI first supplies editable fill-in-the-blanks content instead of inventing personal experience.                                                              |
| Trending and non-trending ideas    | Combined swiper uses observed evidence and reasoned opportunity suggestions; does not claim to predict future trends.                                        |

# 8. Assumptions, dependencies and open decisions

- External data providers, permitted access, quotas, permissions,
  pricing and coverage must be validated against all required
  Growy-referenced competitor functionality.

- The initial Instagram connection is one account per Trellis user;
  availability of personal versus professional account features requires
  integration verification.

- Exact navigation labels and complete three-section allocation are
  retained from the PO baseline but not invented here.

- The precise AI model/provider list, data collection frequencies,
  numerical SLAs, notification timing, retention/deletion details and
  legal/compliance review remain open.

- The PO should explicitly acknowledge the change from the original
  automated-publishing statement in v1.1 before the BRD is treated as a
  fully approved baseline.

# 9. Feasibility and testability revision 1.1

The original BR-01 through BR-14 remain required. A failed technical feasibility check changes implementation readiness, not the Product Owner's requirement. No requirement is removed, weakened, or replaced by an alternative without a recorded Product Owner decision. This section incorporates appropriate findings from the Claude and Gemini reviews while separating evidence from reviewers' unverified suggestions.

## 9.1 Measurable business outcomes

| Outcome | Measurement method | Acceptance-setting rule |
|---|---|---|
| Less time planning content | Minutes needed to prepare and approve a representative seven-day plan | Measure the creator's present manual baseline, then obtain a Product Owner-approved improvement target before implementation acceptance. |
| Faster, grounded analytics | Time and accuracy on a representative set of questions about the account and posts | Compare with manual investigation; score correct subject, metric, date range, source citation and missing-data disclosure independently. |
| Authentic creator writing | Creator's blinded assessment of voice match, usefulness, edit effort and fabricated claims | Establish an evaluation sample of prior captions and new product images; measure each dimension separately. |
| Trust and safety | Unapproved publications, invented factual measurements and prohibited expressions in ready-to-use drafts | Zero known violations in controlled acceptance and failure-injection test scenarios; preserve operational monitoring after release. |
| iPad usefulness | Completion rate for Dashboard, Chat, Swiper, Planner and Publish on a named iPad/browser configuration | Specify test device, network and tasks before adopting numerical speed targets. |

External reviews proposed fixed numerical targets without a measured Trellis baseline. Treat those values as hypotheses, not approved SLAs. Technical Lead proposes initial performance thresholds after a small representative benchmark; Product Owner approves outcome-oriented thresholds before the relevant sprint tests.

## 9.2 Feasibility gates

| Gate | Requirements protected | Required evidence | Handling if evidence fails |
|---|---|---|---|
| FG-01 Account authorization and own insights | BR-01, BR-02, BR-12, BR-13 | Authorized account identity, permissions, sample profile/media/insights, quota and historical coverage | Mark implementation blocked; show unavailable measurements honestly; seek approval for any alternate approach. |
| FG-02 Competitor data | BR-09 | Permitted access to five most recently published posts, captions/media and supported public measures | Do not weaken five-of-five rule; record capability gap and candidate alternatives for Product Owner decision. |
| FG-03 Hot Topics and official updates | BR-10, BR-11 | Attributable source URLs, publication/retrieval dates, retrieval permission and representative topic evidence | Keep requested feature in baseline, report source limitation and evaluate approved alternatives. |
| FG-04 Free multimodal AI | BR-03 to BR-06, BR-10 | Tool use, image understanding, structured outputs, no-cost quotas, data handling and compatible fallback | Return clear capability limits; never silently switch to a paid model. |
| FG-05 User-initiated publishing | BR-08, BR-13 | Authorized account and supported media types, content validation, provider response/confirmation behavior | Keep explicit Publish requirement but mark the integration unavailable until safe and permitted. |
| FG-06 Device and recovery | BR-07, BR-08, BR-10, BR-14 | iPad portrait/landscape, accessible swipe alternatives, draft recovery and reminder behavior | Fix usability/recovery defects; do not drop functions on mobile/desktop without approval. |

The Technical Lead owns evidence collection and records a dated result (Pass, Fail, Unknown) with test account, source version and traceable samples. The Product Owner owns changes to user-visible requirements. A gate result is not permission to use prohibited scraping, unapproved paid services, or unsupported claims.

## 9.3 Clarification of existing business rules

- **BR-09 stays five of five.** Determine the latest five by publication timestamp, not profile pin order. Four skincare posts and one unrelated post fail. Insufficiently accessible evidence produces Unknown/Not verifiable, not a fabricated pass. Define borderline niche examples during acceptance review.
- **BR-12 separates metric collection from analysis.** Session opening or manual request can refresh the analysis using saved data. Historical metrics exist only for observations actually collected. A periodic snapshot mechanism may be selected after quota, user-preference, consent and deployment feasibility review; no daily collection is silently guaranteed.
- **BR-08 and BR-14 remain unchanged.** Reminders are in-app as scoped, but pending reminders persist after a toast disappears. iPad is the primary design target while equivalent core functions remain on desktop and mobile.
- **BR-04 through BR-06 preserve creator control.** Past captions can inform style, not generate fictional experiences. Competitor material informs strategy but not another person's distinctive voice. Only the creator activates or removes prohibited expressions.
- **Account data rights** are not inferred from a provider's technical response. Consent, retention and deletion require a legal/provider-rules check before release.

## 9.4 Readiness register and change control

Every business requirement is still Required. For scheduling work, track Readiness as Ready, Pending feasibility, or Pending acceptance detail; these are engineering statuses, not reductions of Product Owner scope. Each unresolved item needs an owner, evidence, decision criterion and date before it blocks a sprint.

Open decisions: Product Owner acknowledgment of manual publishing versus earlier automatic scheduling; source-refresh frequencies; exact three-section navigation allocation from the PO baseline; legal retention categories; target iPad/browser; official API access; free AI model compatibility; and numerical acceptance thresholds.

**Revision log:** v1.1 (24 October 2026) adds outcome measurement, gates FG-01 through FG-06, edge-case interpretations and resolution ownership. Original BR-01 through BR-14 and earlier change history are retained verbatim.

# 10. Review and sign-off

Status: revised working baseline pending Product Owner approval; the
Product Owner has not yet separately approved every technical refinement
or resolved all third-party feasibility questions.

Product Owner: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date:
\_\_\_\_\_\_\_\_\_\_ Technical lead:
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_
