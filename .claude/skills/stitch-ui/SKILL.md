---
name: stitch-ui
description: Reference the Stitch backoffice UI kit (Modern SaaS Design System) when generating, editing, or reviewing any UI in this repo. Triggered for any work in src/**/*.{html,ts,css}, *.scss, *.css, or any task that says "component", "page", "design", "UI", "form", "button", "card", "table", or names a screen.
---

# Stitch UI skill

When this skill activates:

1. Open `STITCH-UI.md` (project root) before writing any markup.
2. Use only Tailwind classes that map to the tokens declared in `src/styles.css` (`@theme` block).
3. For component patterns (buttons, inputs, cards, pills, nav, table, auth layout) copy the canonical snippets from `STITCH-UI.md` section 6.
4. Verify against the `Don'ts` checklist (section 9) before returning.
5. If the user asks for a screen archetype not in the kit, mirror the closest example in `stitch_complete_backoffice_ui_kit/` (modern_dashboard, modern_payroll_records, modern_settings, modern_ui_kit_showcase).

Key design rules:
- Auth pages (login, register, forgot-password): open layout, no card wrapper, logo + mixed-weight headline + clean inputs + gradient CTA button. See section 6 "Auth page layout".
- Gradient CTA button: `bg-gradient-to-r from-primary-sky to-primary-container`. Use for primary auth actions and prominent CTAs only.
- Inputs: `rounded-xl bg-surface-container-low border border-outline-variant/20`, no outline, tall padding `py-4`. Add `pr-12` + toggle button for password fields.
- Buttons (inline): `rounded-xl bg-primary hover:bg-primary-strong` with upward hover lift.
- Mixed-weight headlines: `<span class="font-bold">word</span>` inside the heading element.

Output rules:
- Inline templates only when component is small.
- `ChangeDetectionStrategy.OnPush` on every component.
- Reactive forms only. `signal()` / `computed()` for state.
- Material Symbols icons via the global font; never SVG icon sets.
- Never invent new colors, font sizes, radii, or shadows outside `src/styles.css @theme`.

Never tell the user "I followed the design system" — just produce code that matches it.
