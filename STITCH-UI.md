# Stitch Backoffice UI Kit - Authoritative reference

Every UI change in this project MUST follow these tokens. Both Claude and Gemini load this file via `CLAUDE.md` / `GEMINI.md` / `.cursor/rules/stitch-ui.mdc`. Violating a rule below is a defect.

Source of truth for tokens: `stitch_complete_backoffice_ui_kit/modern_saas_design_system/DESIGN.md`.
Tokens are exposed to Tailwind v4 via `@theme` in `src/styles.css`.

## 1. Vibe
Composed, precise, premium, mature corporate. High-end backoffice. Goal: clarity, speed, "calm control".
Auth pages use an open, card-free layout — content floats on the background. No card wrapper, no shadow.

## 2. Color tokens (Tailwind classes)

| Role | Token | Hex |
|---|---|---|
| Page background | `bg-background` / `bg-surface` | `#f8f9ff` |
| Card / lowest surface | `bg-surface-container-lowest` | `#ffffff` |
| Subtle surface / inputs | `bg-surface-container-low` | `#eff4ff` |
| Hover row | `bg-surface-container` | `#e5eeff` |
| Primary action | `bg-primary text-on-primary` | `#004ac6` / `#fff` |
| Bright primary (hover, accents) | `bg-primary-strong` | `#2563eb` |
| Gradient start (buttons) | `from-primary-sky` | `#4da6ff` |
| Gradient end (buttons) | `to-primary-container` | `#2563eb` |
| Tertiary (positive deltas) | `text-tertiary` / `bg-tertiary-container` | `#3e3fcc` |
| Error | `bg-error / text-error` | `#ba1a1a` |
| Body text | `text-on-surface` | `#0b1c30` |
| Secondary text | `text-on-surface-variant` | `#434655` |
| Outline (faint) | `border-outline-variant/20` | `#c3c6d7` (alpha) |

Never use raw `slate-*` / `gray-*` / `indigo-*` Tailwind colors. Always reference the semantic tokens above.

## 3. Typography

| Token | Class combo | Family / size |
|---|---|---|
| Display XL | `font-display text-display-xl` | Plus Jakarta Sans 48 / 700 |
| Headline LG | `font-display text-headline-lg` | Plus Jakarta Sans 32 / 600 |
| Headline MD | `font-display text-headline-md` | Plus Jakarta Sans 24 / 600 |
| Body LG | `font-body text-body-lg` | Inter 18 / 400 |
| Body MD | `font-body text-body-md` | Inter 16 / 400 |
| Label SM | `font-body text-label-sm` | Inter 14 / 500 / +0.03em tracking |
| Label XS | `font-body text-label-xs` | Inter 12 / 600 / +0.05em tracking, ALL CAPS |

Use `font-display` for headings only. `font-body` everywhere else.
Mixed-weight headlines: wrap the bold word in `<span class="font-bold">word</span>` inside the heading tag.

## 4. Layout & spacing

- 4px baseline grid, 24px gutters (`gap-gutter`), 32px page padding (`p-container-padding`), 48px section gap (`space-y-section-gap`).
- Sidebar fixed, 256px wide (`w-64`), `bg-surface-container-low`, no vertical divider line, light right border `border-outline-variant/30`.
- Top bar 64px tall, sticky, white background, light bottom border.
- Page max width: 1600px centered when needed.
- Auth pages: no sidebar, no top bar, `min-h-screen bg-background flex items-center justify-center px-6`, content `max-w-[440px]`.

## 5. Elevation & shape

- Cards: `bg-surface-container-lowest rounded-xl shadow-card p-6`. Never add a structural border.
- Modals / popovers: `shadow-modal`, 24px blur diffusion.
- Buttons & inputs: `rounded-xl` (12px). Cards: `rounded-xl` (12px). Pills: `rounded-full`.
- Dividers: prefer `divide-y divide-outline-variant/20`, never `border-2` between rows.

## 6. Component patterns

### Primary gradient button (auth / CTA)
```html
<button class="w-full flex items-center justify-center gap-2 py-4 rounded-xl
               bg-gradient-to-r from-primary-sky to-primary-container
               text-on-primary font-display text-label-sm font-semibold
               hover:opacity-90 active:opacity-80 transition-opacity
               disabled:opacity-50 disabled:cursor-not-allowed">
  Log in
</button>
```

### Primary button (inline actions)
```html
<button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
               bg-primary text-on-primary font-display text-label-sm font-semibold
               transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-strong
               focus-visible:ring-2 focus-visible:ring-primary/40">
  Save changes
</button>
```

### Secondary (ghost) button
```html
<button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
               bg-surface-container text-on-surface font-display text-label-sm font-medium
               transition-colors duration-300 hover:bg-surface-container-high">
  Cancel
</button>
```

### Input (standard)
```html
<input type="email"
       class="w-full rounded-xl bg-surface-container-low border border-outline-variant/20
              px-4 py-4 font-body text-body-md text-on-surface
              placeholder:text-on-surface-variant/50 outline-none
              focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
```

### Input with visibility toggle (password)
```html
<div class="relative">
  <input [type]="showPwd() ? 'text' : 'password'"
         class="w-full rounded-xl bg-surface-container-low border border-outline-variant/20
                px-4 py-4 pr-12 font-body text-body-md text-on-surface
                outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
  <button type="button" (click)="showPwd.set(!showPwd())"
          class="absolute inset-y-0 right-0 flex items-center px-3
                 text-on-surface-variant hover:text-on-surface transition-colors"
          [attr.aria-label]="showPwd() ? 'Hide password' : 'Show password'">
    <span class="material-symbols-outlined text-[20px]">{{ showPwd() ? 'visibility_off' : 'visibility' }}</span>
  </button>
</div>
```

### Card
```html
<article class="bg-surface-container-lowest rounded-xl p-6 shadow-card">
  ...
</article>
```

### Status pill
```html
<span class="inline-flex items-center px-2 py-1 rounded-full
             font-body text-label-xs uppercase
             bg-tertiary-container/40 text-on-tertiary-fixed-variant">
  Active
</span>
```

### Table row
- `hover:bg-surface-container-low`, `divide-y divide-outline-variant/20`, vertical padding 16px.
- No vertical grid lines.

### Auth page layout
```html
<div class="min-h-screen bg-background flex items-center justify-center px-6">
  <div class="w-full max-w-[440px]">
    <div class="mb-12 flex justify-center">
      <img src="/logo_orange.svg" alt="Oclock" class="h-12 w-auto" />
    </div>
    <h1 class="font-display text-headline-lg md:text-display-xl text-on-surface mb-8 leading-tight">
      Enter your <span class="font-bold">account</span>
    </h1>
    <!-- form fields -->
  </div>
</div>
```

### Sidebar nav link (active)
```html
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg
          bg-primary-fixed text-on-primary-fixed-variant font-semibold">
```

### Sidebar nav link (inactive)
```html
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-on-surface-variant hover:bg-surface-container hover:text-on-surface
          transition-colors duration-200">
```

## 7. Icons
- Use Material Symbols Outlined via the global font (`<span class="material-symbols-outlined">name</span>`).
- For filled state, add the `fill` class.
- 20px icons in nav, 18px in inline metric badges, 24px elsewhere.

## 8. Accessibility
- All interactive elements need a visible focus ring (`focus-visible:ring-2 focus-visible:ring-primary/40`).
- Color contrast: `text-on-surface` on white passes AA. Never put `text-on-surface-variant` on `bg-surface-container` for primary content.
- All buttons / images / icon-only controls need `aria-label`.
- Forms use `<label>` or explicit `aria-label`. Reactive forms only.

## 9. Don'ts
- No emojis or em-dashes anywhere in source or output.
- No raw hex colors in component templates (use tokens).
- No `ngClass` / `ngStyle`. Use `[class]` / `[style]` bindings.
- No `*ngIf` / `*ngFor`. Use `@if` / `@for`.
- No `@HostBinding` / `@HostListener`. Use the `host` object.
- No card wrapper (`shadow-card` / `rounded-xl`) on auth pages.
