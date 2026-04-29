---
description: Scaffold a new Angular standalone component that follows the Stitch backoffice UI kit
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
---

You are creating a new standalone Angular component for the Oclock backoffice. The user input ($ARGUMENTS) is the feature name in kebab-case (e.g. `team-list`, `payroll-summary`).

Before generating any file:
1. Read `STITCH-UI.md` if not already in context.
2. Read `src/styles.css` if not already in context (so you know which tokens are exposed).
3. Confirm there is no existing component with the same name under `src/app/`.

Generate exactly four files inside `src/app/<name>/`:
- `<name>.ts` - standalone component, `ChangeDetectionStrategy.OnPush`, signals for state, `@if` / `@for`, `inject()` for DI, no `standalone: true` flag.
- `<name>.html` - markup using Stitch tokens only (`bg-surface-container-lowest`, `rounded-xl`, `shadow-card`, `font-display`, etc).
- `<name>.css` - empty `:host { display: block; }` unless component-specific styling is unavoidable.
- `<name>.spec.ts` - one creation test plus one assertion that the primary heading renders.

Do not modify routes, app shell, or imports outside the new directory. Return only "Created src/app/<name>/" on success.
