## Context

The News2Video frontend (Next.js 14 + Tailwind) currently uses only 3 shadcn/ui components (`Button`, `Card`, `Progress`). Most UI elements are raw HTML elements (`select`, `input`, `textarea`, `button`) styled with custom Tailwind classes and non-semantic color tokens (`bg-bg-secondary`, `accent-blue`, `text-gray-400`). This creates:

- Inconsistent accessibility (no `Label` associations, no `aria-invalid`)
- Duplicated styling logic across 12+ components
- No design-system cohesion — components feel handcrafted rather than systematic
- shadcn/ui infrastructure is already initialized (`components.json`, `tailwind.config.ts`, `globals.css` with CSS variables)

The goal is to migrate all custom UI to full shadcn/ui composition while preserving the existing dark-theme visual identity.

## Goals / Non-Goals

**Goals:**
- Unify all UI under shadcn/ui composition patterns
- Replace raw HTML form controls with shadcn `Input`, `Textarea`, `Select`, `Slider`, `Switch`, `ToggleGroup`
- Replace custom status badges with `Badge`
- Replace manual loading skeletons with `Skeleton`
- Update `globals.css` to use semantic shadcn color variables for dark mode
- Ensure all forms use `Label` + validation states (`data-invalid`, `aria-invalid`)
- Remove custom color tokens in favor of `bg-background`, `text-muted-foreground`, etc.

**Non-Goals:**
- No backend or API changes
- No routing or page logic changes
- No state management changes (TanStack Query, localStorage remain)
- No animation/transitions beyond what shadcn provides natively
- No introduction of complex design tokens beyond shadcn's standard CSS variables

## Decisions

### 1. Use `base` style shadcn, not `radix-nova`
**Rationale**: The project already has `components.json` with `"style": "radix-nova"`. However, the current custom styling is closer to `base` style's simpler composition. We'll keep the existing `radix-nova` configuration but adopt `base` patterns for new components since they are more lightweight and don't require `@radix-ui/react-*` dependencies for every component.
**Alternative**: Switch to pure `base` style — rejected because it would require re-initializing shadcn and overwriting existing Button/Card/Progress files.

### 2. Install components via `npx shadcn@latest add`
**Rationale**: This is the canonical way. The project uses `npx` as package manager (Node.js project).
**Alternative**: Copy files manually from registry — rejected because CLI handles dependencies and import rewriting automatically.

### 3. Map custom colors to shadcn semantic tokens
| Current Token | shadcn Equivalent |
|---|---|
| `bg-bg-primary` | `bg-background` |
| `bg-bg-secondary` | `bg-muted` / `bg-card` |
| `bg-bg-tertiary` | `bg-accent` |
| `text-gray-400` | `text-muted-foreground` |
| `text-white` | `text-foreground` |
| `accent-blue` | `bg-primary` |
| `accent-teal` | `bg-secondary` |
| `accent-red` | `bg-destructive` |
| `border-border` | `border-border` (already exists) |

### 4. Keep `font-display` (Montserrat) and `font-sans` (Inter)
**Rationale**: These are already in `tailwind.config.ts` and part of the brand identity. shadcn does not prescribe fonts.

### 5. Use `ToggleGroup` for format selection and music tracks
**Rationale**: `ConfigPanel` and `BgMusicSelector` use manually looped `Button` with active-state logic. `ToggleGroup` is shadcn's built-in pattern for exactly this use case.
**Alternative**: Keep manual `Button` looping — rejected because it duplicates shadcn's solved problem.

### 6. Use `Tabs` for Navbar instead of custom active-state links
**Rationale**: The `Navbar` currently manually manages active states with `pathname === item.href`. `Tabs` with `value` bound to current route provides the same behavior with built-in accessibility and keyboard navigation.
**Alternative**: Use `NavigationMenu` — rejected because `NavigationMenu` is overkill for 4 simple nav items; `Tabs` is the right semantic fit for a top nav bar.

## Risks / Trade-offs

- **[Risk]** shadcn/ui components may have different default sizing/spacing than current custom elements → **Mitigation**: Use `className` for layout adjustments only; never override component colors/typography.
- **[Risk]** `radix-nova` style may add visual bulk (padding, border-radius) compared to current minimal styling → **Mitigation**: Apply `--radius: 0.5rem` (already set to `0.625rem`) and use `size="sm"` variants.
- **[Risk]** Color migration may change visual identity slightly → **Mitigation**: Map carefully; keep custom fonts; review with screenshots before/after.
- **[Trade-off]** Installing many shadcn components increases bundle size slightly. Each component is ~2-5KB gzipped. With 10 components, estimated overhead is ~30KB — acceptable for a dashboard app.

## Migration Plan

1. **Phase 1 — Install Components**: Run `npx shadcn@latest add` for all needed components
2. **Phase 2 — Update Globals**: Adjust `globals.css` dark theme colors to match current visual identity using semantic tokens
3. **Phase 3 — Migrate Components**: Refactor each custom component (see tasks.md for order)
4. **Phase 4 — Verify**: Check all pages render identically; run `next build` to ensure no errors
5. **Rollback**: If issues arise, revert the commit; all changes are frontend-only and isolated to `frontend/src/`

## Open Questions

- Should the landing page (`/landing`) also be migrated, or is it intentionally minimal/marketing-focused?
- Should `VoicePreview` continue using browser `SpeechSynthesisUtterance`, or should we add a shadcn `AudioPlayer` component?
