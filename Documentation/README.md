# Trellis Documentation

Reviewed 8 November 2026. Start a new chat with PROJECT_HANDOFF.md, then the current sprint plan and working backlog. Use the requirements documents for full-product intent and the closeout for implemented behavior.

## Active documents

| Document | Purpose and reason to keep |
|---|---|
| [Project handoff](PROJECT_HANDOFF.md) | Durable conversation context, working preferences, decisions, important incidents, verification limits, and the next action for a new chat |
| [VS Code setup](VSCODE_SETUP.md) | One-command development launch, restart controls, formatting, Codex learning workflow, Explorer organization, theme, terminal fonts, and SQLite viewing |
| [Sprint 2 plan](Trellis_Sprint_2_Plan_v0_1.md) | Current implementation scope, tasks, dependencies, and acceptance criteria for Overview, Analytics, and Profile Audit |
| [Working backlog](BACKLOG.md) | Sprint 1 carryover, Sprint 2/2B allocation, and remaining product areas |
| [Sprint 1 closeout](Trellis_Sprint_1_Closeout.md) | Delivered behavior, verification evidence, startup/configuration instructions, key recovery, and limitations |
| [Release roadmap](Trellis_Product_Roadmap_v0_1.md) | December deadline, capacity assumptions, current forecast, and the historical planning baseline |
| [BRD v1.1](Trellis_BRD_v1_1.md) | Product goals, business rules, scope, and changes from the original owner request |
| [SRS v1.1](Trellis_SRS_v1_1.md) | Requirement IDs and testable behavior across the complete product |
| [Architecture v0.2](Trellis_Architecture_v0_2.md) | Longer-term architecture proposals, ownership/data principles, and design decisions. The implementation note identifies current SQLite/SCS choices |
| [Wireframes v0.1](Trellis_Complete_LoFi_Wireframes_v0_1.pdf) | Distinct visual reference for 23 screen families and states. Presence of a screen does not establish implemented functionality |
| [Product-owner feature summary](Trellis_Product_Owner_Feature_Summary_v1_1.pdf) | Original source of requested product behavior. Later decisions are recorded in the BRD and sprint plans |
| [Instagram investigation](../INSTAGRAM-ISSUE.md) | Historical evidence and unresolved IG-001 discovery issue, retained at the repository root |

## Archived reference material

| Document | Disposition |
|---|---|
| [Full review](Archive/Trellis%20Full%20Review%20of%20BRD%2C%20SRS%20and%20Architecture.pdf) | Historical critique used in the revised baselines. The available 14-page export ends at content requirements, so its title overstates the coverage present in this copy |
| [Senior engineering review](Archive/Trellis_Senior_Engineering_Review_and_Action_Plan.html.pdf) | Historical critique with assumptions and proposed thresholds. The newer baselines explicitly qualify reviewer proposals |
| [Sprint 0 plan](Archive/Trellis_Sprint_0_Plan_v0_1.md) | Past discovery plan. It remains useful for unfinished feasibility work and explains the original capacity assumptions |

These files provide decision history. Their action plans and proposed approvals must be interpreted alongside later user decisions and the current sprint.

## Removed superseded copies

The following files were committed and pushed in `2625e66` before removal from the current working tree.

- Trellis_BRD_v1_0.docx, superseded by BRD v1.1. All 14 original BR identifiers appear in the newer document.
- Trellis_SRS_v1_0.docx, superseded by SRS v1.1. All 83 extracted requirement and test identifiers appear in the newer document.
- Trellis_System_Architecture_v0.1.pdf, superseded by Architecture v0.2, whose revision record preserves the prior design intent and decisions while adding contracts and verification detail.

These versions remain recoverable from Git history. Requirement-ID preservation verifies continuity of the inventory, while the newer revision records describe substantive additions and changes.

## Authority and maintenance

Explicit user decisions determine current scope. The BRD and SRS describe the complete intended product. Sprint plans select work for a timebox. Closeouts and code establish delivered behavior. The roadmap forecasts timing, and older reviews supply context.

Update BACKLOG.md when deferring a task and the roadmap when evidence changes the release forecast. Record completion evidence in the relevant sprint closeout. Keep local credentials, tokens, and SQLite databases outside Git.

The earlier roadmap mentions 66 stories and a separate full backlog, but a detailed 66-story register is absent from this folder. BACKLOG.md currently groups work by requirement IDs and implementation gaps. A complete story-by-story delivery percentage cannot be calculated from these documents.
