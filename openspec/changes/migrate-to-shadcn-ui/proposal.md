## Why

The frontend currently uses a mix of raw HTML elements (select, input, textarea) and manual Tailwind classes alongside a minimal shadcn/ui setup (only Button, Card, Progress installed). This creates inconsistent UX, duplicated styling logic, and missed opportunities for shadcn/ui's robust accessibility, composition patterns, and design system. Migrating fully to shadcn/ui will unify the UI, reduce custom CSS, and provide a maintainable component foundation.

## What Changes

- **Install missing shadcn/ui components**: Select, Slider, Tabs, Badge, Separator, Skeleton, ToggleGroup, Input, Textarea, Label, Switch
- **Refactor custom components** to use shadcn/ui primitives:
  - `ContentEditor` → use `Textarea` + `Label`
  - `ConfigPanel` → use `Select`, `Slider`, `ToggleGroup`, `Switch`
  - `Navbar` → use `Tabs` or `NavigationMenu`
  - `HistoryTable` → use `Badge` for status, `Skeleton` for loading, `Table` from shadcn
  - `ProgressTracker` → use `Progress` (already installed) + `Badge`
  - `RecentVideoRow` → use `Badge`, `Skeleton`
- **Replace manual styling** with semantic tokens (`bg-background`, `text-muted-foreground`, etc.)
- **Update form patterns** to use `FieldGroup` + `Field` + `Label` + validation states
- **Apply shadcn styling rules**: `gap-*` not `space-y-*`, `size-*` not `w-* h-*`, `cn()` for conditional classes
- **BREAKING**: Remove custom color tokens (`bg-bg-secondary`, `accent-blue`) in favor of shadcn CSS variables

## Capabilities

### New Capabilities
- `shadcn-form-system`: Migrate all forms to shadcn/ui `FieldGroup` + `Field` + `Input` + `Label` + validation patterns
- `shadcn-data-display`: Migrate tables, lists, and status displays to `Table`, `Badge`, `Skeleton`, `Separator`
- `shadcn-navigation`: Migrate `Navbar` to `Tabs` or `NavigationMenu` with proper shadcn composition
- `shadcn-config-panel`: Migrate `ConfigPanel` to use `Select`, `Slider`, `ToggleGroup`, `Switch`
- `shadcn-progress-ui`: Enhance `ProgressTracker` with `Progress` + `Badge` + proper step composition

### Modified Capabilities
- *(none — no existing spec-level behavior changes, only implementation migration)*

## Impact

- **Affected files**: `frontend/src/components/*.tsx`, `frontend/src/app/**/*.tsx`, `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`
- **Dependencies**: `lucide-react` (already configured), shadcn/ui CLI for component installation
- **Systems**: Frontend UI layer only — no backend/API changes
- **Risk**: Low — purely presentational migration with existing shadcn/ui infrastructure already in place
