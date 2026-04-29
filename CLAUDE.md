# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run start          # dev server on http://localhost:4200
bun run build          # dev build (generates env first)
bun run build:prod     # production build
bun run test:run       # run all tests once (Vitest, no watch)
bun run test           # run tests in watch mode
bun run lint           # ESLint + angular-eslint
```

Before every build/test, `scripts/set-env.js` auto-generates `src/environments/environment.ts` from `.env` (dev) or `.env.production` (prod via `--prod` flag). That file is gitignored. Copy `.env.example` to `.env` if it is missing.

To run a single test file:
```bash
cd <project-root> && bun run config && npx vitest run src/app/some.spec.ts
```

Package manager is **bun**. Do not use npm or pnpm.

## Architecture

### Project purpose
Time-tracking backoffice platform. See `user-stories.md` for the full feature spec (10 epics, ~20 user stories). Two roles: unauthenticated employees who clock in/out at `/clock/:accountId`, and authenticated admins who manage markings, reports, and accounts.

### Stack
- **Angular 21** (standalone components, no NgModules), **Tailwind v4** (CSS-first `@theme` config), **Vitest** via `@angular/build:unit-test`.
- Backend: NestJS + MongoDB (separate repo at `../sysexpert-back`, port 3010 locally).
- Auth: JWT (stored TBD per HU-2.1; prefer httpOnly cookie).

### Source layout
```
src/
  app/
    app.ts / app.html / app.css   # Root shell: sidebar + topbar + router-outlet
    app.routes.ts                 # All routes (currently empty, add lazy-loaded features here)
    app.config.ts                 # ApplicationConfig, provideRouter, future: provideHttpClient + interceptors
  environments/
    environment.ts                # AUTO-GENERATED – never edit by hand
  styles.css                      # Global Tailwind @import + @theme tokens (design system)
  index.html                      # Preloads Plus Jakarta Sans, Inter, Material Symbols fonts
```

Feature modules will live under `src/app/<feature>/` (e.g. `clock/`, `markings/`, `reports/`).

### Design system
`STITCH-UI.md` is the canonical reference. Tokens are declared in `src/styles.css` under `@theme`. Never use raw `slate-*`/`gray-*`/`indigo-*` Tailwind classes; always use the semantic tokens (`bg-surface`, `text-on-surface`, `bg-primary`, etc.).

### Angular rules (non-obvious ones)
- Do NOT set `standalone: true` — it is the default in Angular v20+.
- Use `inject()` for DI, not constructor injection.
- Use `input()` / `output()` signal-based functions, not `@Input` / `@Output` decorators.
- Use `host` object in `@Component`/`@Directive` instead of `@HostBinding`/`@HostListener`.
- Every component needs `changeDetection: ChangeDetectionStrategy.OnPush`.
- `[class]` bindings instead of `ngClass`; `[style]` bindings instead of `ngStyle`.
- Native control flow (`@if`, `@for`, `@switch`) — never `*ngIf` / `*ngFor`.
- Reactive forms only (no template-driven).
- Lazy-load every feature route.

### Token-efficient output rules
- Read existing files before writing. Prefer targeted edits over full-file rewrites.
- No over-engineering. No speculative features.
- No sycophantic openers/closers, no emojis, no em-dashes.
- Profiles for specialized contexts are in `profiles/` (coding, agents, analysis, benchmark).

## Key decisions already made
- `.env*` files are gitignored (except `.env.example`). `src/environments/` is gitignored.
- Production API base URL: `https://api.sysexpert.us` (update in `.env.production`).
- Backend runs on port `3010` locally (see `../sysexpert-back`).
- `eslint.config.js` uses flat config with `angular-eslint` + `typescript-eslint`.
- Prettier: 100-char print width, single quotes, `angular` parser for HTML.
- `PreCompact` Claude hook auto-commits a checkpoint before context compaction (see `.claude/settings.json`).
