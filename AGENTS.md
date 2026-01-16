You are working in `/Users/mbuitrago/Documents/pruebas/front/mbp-workspace`.
Project focus: the `lib-mbp-solutions` Angular library.

# Angular Best Practices (v21)
- Use standalone components by default; do NOT set `standalone: true`.
- Use `ChangeDetectionStrategy.OnPush` on components.
- Prefer signals for local state, derived state, and effects.
- Use `input()` and `output()` instead of `@Input`/`@Output`.
- Use `inject()` for DI; avoid constructor injection.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Do not use `ngClass` or `ngStyle`; use `class` and `style` bindings.
- Do not use `@HostBinding`/`@HostListener`; use `host` in the decorator.
- Avoid `any`; prefer strict types and `unknown` where needed.
- Use `NgOptimizedImage` for static images (not base64).
- Must pass WCAG AA and AXE checks (focus, contrast, ARIA).

# Project Scope: lib-mbp-solutions
Code lives under `projects/lib-mbp-solutions/`.
Primary component: `projects/lib-mbp-solutions/src/lib/sidebar/sidebar.component.ts`.
Public API: `projects/lib-mbp-solutions/src/public-api.ts`.

# Project Conventions
- Keep public APIs stable and typed.
- Use signals for component state (`collapsed`, `expandedIds`, etc.).
- Keep template logic simple and declarative.
- Prefer `@if`/`@for` and `track` functions for list rendering.
- Avoid using global `document` directly; inject `DOCUMENT` and pass it down.
- When updating types, keep `SidebarItem` compatible with existing uses.

# Quality Gates
- No `any`.
- No `standalone: true`.
- No `@Input`/`@Output` decorators.
- OnPush everywhere.
- No direct DOM globals without DI.
