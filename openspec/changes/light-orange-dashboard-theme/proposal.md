## Why

The current News2Video frontend uses a dark theme with a basic top navigation bar and simple card layout. Users want a more professional, polished dashboard experience that feels like a modern SaaS admin panel. Switching to a light orange-white theme will improve readability, create a more inviting brand identity, and align with modern dashboard UX patterns (sidebar navigation, stat widgets, activity feeds, and chart visualizations).

## What Changes

- **Switch to light theme**: Replace dark background (`bg-background` dark) with white/cream light theme (`bg-background` white)
- **Orange primary color**: Replace blue (`hsl(217 91% 60%)`) with orange (`hsl(24 95% 53%)`) as primary action color
- **Dashboard layout overhaul**: Redesign `/` (Dashboard) with professional dashboard patterns:
  - **Sidebar navigation** (collapsible, icon + label) replacing top navbar
  - **Stats cards row** with icons, trends, and sparkline-style mini charts
  - **Recent activity feed** with timestamps and status
  - **Quick action buttons** prominently placed
  - **Data visualization cards** (placeholder for future charts)
- **Navbar refactoring**: Convert top `Tabs` nav to a vertical `Sidebar` with orange active states
- **Page layout standardization**: All pages (`/new`, `/history`, `/video/[id]`, `/settings`, `/landing`) adapt to light theme with orange accents
- **Typography refinement**: Use clearer hierarchy — page titles, section headers, body text with proper contrast on light backgrounds
- **Card styling**: White cards with subtle shadow/border instead of dark cards, orange accents for primary actions
- **Badge/Status colors**: Adapt status badges for light theme (orange for primary, gray for secondary, red for destructive)
- **BREAKING**: The color palette flips from dark to light — any hardcoded dark colors in custom components will need updating

## Capabilities

### New Capabilities
- `sidebar-navigation`: Collapsible vertical sidebar with icon + label navigation, orange active state, mobile drawer variant
- `dashboard-stats-widgets`: Professional stat cards with icons, trend indicators, and mini sparklines
- `light-orange-theme`: Complete light theme CSS variable system with orange primary, cream backgrounds, proper contrast ratios
- `dashboard-layout`: Two-column dashboard layout (main content + optional right panel for recent activity/quick stats)

### Modified Capabilities
- *(none — this is purely a visual/presentational change, no spec-level behavior changes)*

## Impact

- **Affected files**: `frontend/src/app/globals.css`, `frontend/src/app/page.tsx`, `frontend/src/components/Navbar.tsx`, `frontend/src/app/layout.tsx`, and all page files for color consistency
- **Dependencies**: Existing shadcn/ui components (no new installations needed beyond potential chart library if added)
- **Systems**: Frontend UI layer only — no backend or API changes
- **Risk**: Medium — widespread CSS variable changes affect every component; requires thorough visual regression check across all routes
