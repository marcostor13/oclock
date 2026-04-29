# Project rules (token-efficient baseline)

## Approach
- Read existing files before writing. Do not re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers ("Sure!", "Great question!") or closing fluff ("Let me know!").
- No emojis or em-dashes. Plain hyphens and straight quotes only.
- Write complete solutions. Test once before declaring done.
- No over-engineering. Favor simple, direct fixes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs first.
- Prefer targeted edits over full-file rewrites.
- User instructions always override this file.

## Code (Angular front-end)
See `AGENTS.md` for the full Angular / TypeScript style guide. Key points:
- Strict TypeScript. No `any`. Use `unknown` when uncertain.
- Standalone components. Do not set `standalone: true` (default in v20+).
- `signal()` / `computed()` for state. Never `mutate`.
- `inject()` over constructor injection. `providedIn: 'root'` for singletons.
- `ChangeDetectionStrategy.OnPush` on every component.
- Native control flow (`@if`, `@for`, `@switch`). No `*ngIf` / `*ngFor`.
- Reactive forms only.
- WCAG AA + AXE clean.

## UI / Design system
For any UI work follow `STITCH-UI.md` and `.cursor/rules/stitch-ui.mdc`:
- Plus Jakarta Sans (display) + Inter (body / data).
- Electric Indigo Blue primary (`#2563eb` / `#004ac6`).
- White cards on `#f8f9ff` surface, ambient shadows, no structural borders.
- 8px radius for buttons / inputs, 12px for cards.
- 4px baseline grid, 24px gutters, 32px page padding.

## Environments
- Local + production URLs come from `.env` / `.env.production` via `scripts/set-env.js`.
- Never commit real secrets or production hostnames in code. `.env*` is gitignored except `.env.example`.

## Profile switching
This file is the universal baseline. To swap to a specialized profile:
```
cp profiles/CLAUDE.coding.md GEMINI.md
cp profiles/CLAUDE.agents.md GEMINI.md
cp profiles/CLAUDE.analysis.md GEMINI.md
```
