## Context

The News2Video frontend currently uses a dark theme (`--background: 240 10% 3.9%`, near-black) with blue primary (`--primary: 217 91% 60%`). The dashboard (`/`) is a single-column layout with 3 stat cards, a CTA button, and a recent videos list. Navigation is a top horizontal bar using shadcn Tabs. Users have requested a more professional, "standard dashboard" look with a light orange-white color scheme.

Current layout pain points:
- Top nav wastes vertical space on a dashboard
- Stat cards are plain with no visual hierarchy
- No sidebar means less room for future navigation expansion
- Dark theme feels heavy for a content creation tool

## Goals / Non-Goals

**Goals:**
- Switch from dark theme to light orange-white theme
- Replace top navbar with a collapsible left sidebar
- Redesign Dashboard (`/`) with professional stat widgets, activity feed, and quick actions
- Ensure all pages (`/new`, `/history`, `/video/[id]`, `/settings`, `/landing`) work in light theme
- Maintain shadcn/ui component compatibility

**Non-Goals:**
- No new backend APIs or data models
- No chart library integration (Recharts/Chart.js) in this change — only placeholder widgets
- No animation beyond CSS transitions
- No user onboarding flow

## Decisions

### 1. Light theme CSS variables
**Rationale**: shadcn/ui supports light themes via CSS variable inversion. We'll set `:root` to light and add a `.dark` class for dark mode fallback (even though app will default light).

| Token | Dark (Old) | Light Orange (New) |
|---|---|---|
| `--background` | `240 10% 3.9%` | `0 0% 100%` (white) |
| `--foreground` | `0 0% 98%` | `20 14% 10%` (near-black) |
| `--primary` | `217 91% 60%` (blue) | `24 95% 53%` (orange) |
| `--secondary` | `240 4.8% 15%` | `30 20% 96%` (cream) |
| `--muted` | `240 4.8% 15%` | `30 15% 95%` |
| `--muted-foreground` | `240 5% 65%` | `20 10% 45%` |
| `--accent` | `174 72% 55%` | `24 95% 53%` |
| `--card` | `240 10% 6%` | `0 0% 100%` |
| `--border` | `240 4% 20%` | `20 10% 90%` |
| `--ring` | `217 91% 60%` | `24 95% 53%` |

### 2. Sidebar navigation using shadcn `Sidebar` component
**Rationale**: shadcn/ui has an official `Sidebar` block (not in default install). We'll build a custom Sidebar using `Sheet` (mobile) + fixed div (desktop) with `Tooltip` for collapsed state. This avoids adding heavy dependencies.
**Alternative**: Install `@shadcn/sidebar` block — rejected because it's experimental and adds complexity; custom implementation gives more control.

### 3. Dashboard stat widgets: custom component, no chart library
**Rationale**: User wants "professional dashboard" but charts are out of scope. We'll create `StatCard` components with icons, values, trend arrows (↑↓), and progress bars. This gives the "dashboard feel" without new dependencies.
**Alternative**: Install `recharts` — rejected (non-goal).

### 4. Two-column layout on desktop for Dashboard
**Rationale**: Place stat cards + recent videos on left (2/3), quick stats/activity on right (1/3). On mobile, stacks to single column.

### 5. Keep `font-display` (Montserrat) for brand, use Inter for body
**Rationale**: Montserrat is bold and modern — works well with orange. No font changes needed.

## Risks / Trade-offs

- **[Risk]** Light theme may reduce perceived "professionalism" if contrast is poor → **Mitigation**: Use near-black foreground (`20 14% 10%`) on white, not pure gray; test all text sizes
- **[Risk]** Sidebar takes horizontal space on small laptops → **Mitigation**: Make sidebar collapsible to icon-only (64px), use Tooltip for labels
- **[Risk]** Orange primary may feel "warning-like" for destructive actions → **Mitigation**: Keep `destructive` as red; orange only for primary/actions
- **[Trade-off]** Removing dark mode entirely might upset users who prefer it → **Mitigation**: Keep `.dark` class support in CSS for future toggle; default to light only

## Migration Plan

1. Update `globals.css` variables to light orange
2. Build `Sidebar` component
3. Update `layout.tsx` to use Sidebar
4. Redesign `page.tsx` (Dashboard)
5. Update all other pages for light theme consistency
6. Test build + visual check all routes
7. Rollback: revert `globals.css` to previous values if needed

## Open Questions

- Should we add a theme toggle (light/dark) in Settings, or force light only?
- Do we want rounded corners (`--radius`) increased for a softer feel (e.g., `0.75rem`)?
