# /ui-component <kebab-name>

You are creating a new standalone Angular component for the Oclock backoffice.

Before generating any file:
1. Read `STITCH-UI.md`.
2. Read `src/styles.css` to confirm exposed tokens.
3. Confirm no existing component with the same name under `src/app/`.

Generate exactly four files inside `src/app/<name>/`:
- `<name>.ts` - standalone, `ChangeDetectionStrategy.OnPush`, signals, `@if` / `@for`, `inject()`, no `standalone: true` flag.
- `<name>.html` - Stitch tokens only.
- `<name>.css` - `:host { display: block; }`.
- `<name>.spec.ts` - creation test + heading assertion.

Do not modify routes, shell, or unrelated imports.
