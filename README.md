# Trellis

Instagram analytics and content-planning application built with Angular, Go, and SQLite.

## Workspaces

| Folder | What to work on here |
|---|---|
| Backend | Go HTTP handlers, authentication, Instagram integration, and SQLite storage |
| Frontend/src/app | Angular pages, services, routes, and templates |
| Documentation | Project handoff, sprint plans, requirements, and backlog |
| scripts | Development process launcher |

## Start development

Open this root folder in VS Code, select **Trellis: start everything** in Run and Debug, and press F5. Use the floating toolbar to restart the servers.

Alternatively, run `node scripts/dev.cjs` from this folder.

See [VS Code setup](Documentation/VSCODE_SETUP.md) for formatting, extensions, terminal fonts, SQLite viewing, and launch limitations. See [Sprint 1 closeout](Documentation/Trellis_Sprint_1_Closeout.md) for local credentials and encryption-key configuration.

## Project context

- [Start a new chat with the project handoff](Documentation/PROJECT_HANDOFF.md)
- [Current Sprint 2 plan](Documentation/Trellis_Sprint_2_Plan_v0_1.md)
- [Working backlog](Documentation/BACKLOG.md)
- [Documentation index](Documentation/README.md)

## Explorer layout

VS Code groups root configuration and the investigation record under this README. Frontend configuration is grouped under package.json. Backend module configuration and local environment files are grouped under go.mod. Tests appear beneath their related source files, and SQLite journal files appear beneath their database.

Expand the corresponding file to see the grouped entries. Source folders, routes, and the databases remain directly accessible. Generated output and editor metadata are hidden by workspace settings.
