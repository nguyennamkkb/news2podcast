## 1. Theme & CSS Variables

- [ ] 1.1 Update `frontend/src/app/globals.css` `:root` to light orange-white palette
- [ ] 1.2 Add `.dark` class fallback with original dark theme variables
- [ ] 1.3 Update legacy utility class mappings to match new orange palette
- [ ] 1.4 Verify `tailwind.config.ts` color mappings still work with new HSL values
- [ ] 1.5 Run `npm run build` to verify no CSS variable conflicts

## 2. Sidebar Navigation Component

- [ ] 2.1 Create `frontend/src/components/Sidebar.tsx` with desktop fixed sidebar (240px expanded, 64px collapsed)
- [ ] 2.2 Add nav items: Dashboard, New Video, History, Settings with icons
- [ ] 2.3 Implement active state with orange background (`bg-primary`, `text-primary-foreground`)
- [ ] 2.4 Add collapse/expand toggle button with state persistence in `localStorage`
- [ ] 2.5 Add `Tooltip` for collapsed icon-only labels
- [ ] 2.6 Implement mobile `Sheet` drawer variant (slides from left)
- [ ] 2.7 Add mobile hamburger trigger in top-left of navbar area
- [ ] 2.8 Update `frontend/src/app/layout.tsx` to wrap content with Sidebar
- [ ] 2.9 Remove old `Navbar.tsx` import from layout (or repurpose as top bar for mobile/breadcrumb)

## 3. Dashboard Page Redesign

- [ ] 3.1 Create `frontend/src/components/StatCard.tsx` with icon, value, label, and optional trend indicator
- [ ] 3.2 Create `frontend/src/components/ActivityFeed.tsx` for right panel recent jobs list
- [ ] 3.3 Redesign `frontend/src/app/page.tsx` with two-column layout:
  - Left column (2/3): stat cards row + recent videos list
  - Right column (1/3): activity feed + quick tips
- [ ] 3.4 Update stat cards to use orange icons and proper spacing
- [ ] 3.5 Ensure responsive stacking on mobile (single column)
- [ ] 3.6 Replace "Cost" stat with a more relevant metric (e.g., "Success Rate" or keep as placeholder)
- [ ] 3.7 Add orange accent to "+ New Video" CTA button

## 4. Page Layout Standardization

- [ ] 4.1 Update `frontend/src/app/new/page.tsx`: adapt to light theme, remove dark custom colors
- [ ] 4.2 Update `frontend/src/app/history/page.tsx`: adapt to light theme
- [ ] 4.3 Update `frontend/src/app/video/[id]/page.tsx`: adapt to light theme, ensure video preview works on white bg
- [ ] 4.4 Update `frontend/src/app/settings/page.tsx`: adapt to light theme, form inputs visible on white
- [ ] 4.5 Update `frontend/src/app/landing/page.tsx`: adapt to light theme or keep as separate dark landing (optional)
- [ ] 4.6 Ensure all Cards use white background (`bg-card` which is now white)
- [ ] 4.7 Update `Badge` variants for light theme contrast

## 5. Component Cleanup

- [ ] 5.1 Remove or repurpose old `Navbar.tsx` (if not reused as breadcrumb bar)
- [ ] 5.2 Update `ProgressTracker.tsx` progress bar colors for light theme
- [ ] 5.3 Update `ErrorBoundary.tsx` Alert styling for light background
- [ ] 5.4 Update `JobError.tsx` Alert styling for light background
- [ ] 5.5 Verify `Separator` visibility on light backgrounds (should be subtle gray)
- [ ] 5.6 Verify `Table` header row contrast on light theme
- [ ] 5.7 Check all `Skeleton` colors match light theme (should be gray-200, not dark gray)

## 6. Responsive & Accessibility

- [ ] 6.1 Test sidebar collapse/expand on tablet (768px-1024px)
- [ ] 6.2 Test mobile Sheet drawer opens/closes smoothly
- [ ] 6.3 Verify all text meets WCAG 4.5:1 contrast ratio on white backgrounds
- [ ] 6.4 Ensure focus rings (orange `--ring`) are visible on all interactive elements
- [ ] 6.5 Check that `aria-current="page"` is set on active sidebar nav item

## 7. Verification

- [ ] 7.1 Run `npm run build` — zero TypeScript errors
- [ ] 7.2 Visually verify `/` Dashboard: stats, recent videos, sidebar, two-column layout
- [ ] 7.3 Visually verify `/new`: form inputs visible, ConfigPanel readable
- [ ] 7.4 Visually verify `/history`: table rows readable, search/filter visible
- [ ] 7.5 Visually verify `/video/[id]`: video preview, progress/download buttons
- [ ] 7.6 Visually verify `/settings`: form controls, save notification
- [ ] 7.7 Visually verify `/landing`: consistent with light theme (or keep dark if intentional)
- [ ] 7.8 Test sidebar collapse, mobile hamburger, navigation between pages
- [ ] 7.9 Run Lighthouse accessibility audit, address any contrast issues
