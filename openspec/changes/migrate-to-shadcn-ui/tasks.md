## 1. Install shadcn/ui Components

- [x] 1.1 Install `select`, `slider`, `switch`, `toggle-group`, `tabs`, `badge`, `separator`, `skeleton`, `table`, `label`, `input`, `textarea` via `npx shadcn@latest add`
- [x] 1.2 Verify all components installed in `frontend/src/components/ui/`
- [x] 1.3 Run `next build` to ensure no missing dependencies

## 2. Update Theme & Globals

- [x] 2.1 Update `frontend/src/app/globals.css` `:root` variables for dark theme matching current visual identity
- [x] 2.2 Add `.dark` class variant — use `darkMode: ["class"]` in tailwind.config.ts
- [x] 2.3 Verify `font-family` imports remain (Inter, Montserrat, JetBrains Mono)
- [x] 2.4 Run dev server and visually confirm theme renders correctly on `/`

## 3. Migrate Form Components

- [x] 3.1 Refactor `ContentEditor` to use `Textarea` + `Label` instead of raw `<textarea>`
- [x] 3.2 Refactor `ConfigPanel` voice selection to use `Select` + `Label`
- [x] 3.3 Refactor `ConfigPanel` format selection to use `ToggleGroup` + `ToggleGroupItem`
- [x] 3.4 Refactor `ConfigPanel` duration selection to use `ToggleGroup`
- [x] 3.5 Refactor `ConfigPanel` slide count to use `Slider` + `Label`
- [x] 3.6 Integrate `BgMusicSelector` into `ConfigPanel` as `Switch` + conditional `Select`
- [x] 3.7 Add `FieldGroup` + `Field` wrapper to `ConfigPanel` sections with proper `Label` association
- [x] 3.8 Add word-count validation using `data-invalid` / `aria-invalid` on `ContentEditor`

## 4. Migrate Data Display Components

- [x] 4.1 Refactor `HistoryTable` to use `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`
- [x] 4.2 Replace status emojis in `HistoryTable` with `Badge` (variant per status)
- [x] 4.3 Replace status emojis in `RecentVideoRow` with `Badge`
- [x] 4.4 Replace custom loading skeletons in `HistoryTable` with `Skeleton`
- [x] 4.5 Replace custom loading skeletons in `DashboardPage` (`page.tsx`) with `Skeleton`
- [x] 4.6 Replace `border-t` / `<hr>` dividers in `HistoryTable`, `RecentVideoRow`, `page.tsx` with `Separator`
- [x] 4.7 Add `Badge` for "Cached" indicator in `VideoDetailPage`

## 5. Migrate Navigation

- [x] 5.1 Refactor `Navbar` to use `Tabs` with `TabsList` and `TabsTrigger` bound to `usePathname()`
- [x] 5.2 Replace mobile hamburger menu with `Sheet` containing `Tabs` navigation
- [x] 5.3 Verify active tab styling matches current design (blue accent)
- [x] 5.4 Add `Breadcrumb` to `VideoDetailPage` (Dashboard > Video > title)

## 6. Migrate Progress UI

- [x] 6.1 Refactor `ProgressTracker` progress bar to use `Progress` with `value={percent}`
- [x] 6.2 Replace step status emojis with `Badge` variants in `ProgressTracker`
- [x] 6.3 Add status `Badge` to `VideoDetailPage` processing header
- [x] 6.4 (Optional) Restructure step list as vertical stepper using `Tabs` with vertical orientation

## 7. Migrate Remaining Custom Components

- [x] 7.1 Refactor `JobError` to use `Alert` component instead of custom styled div
- [x] 7.2 Refactor `ErrorBoundary` to use `Alert` + `Button` instead of custom styled div
- [x] 7.3 Refactor `VoicePreview` to use `Button` with `data-icon` pattern instead of emoji text
- [x] 7.4 Update `landing/page.tsx` `Button` and `Card` usage to use full shadcn composition

## 8. Cleanup & Verification

- [x] 8.1 Search and remove all custom color classes (`bg-bg-secondary`, `accent-blue`, `text-gray-400`, etc.) replacing with semantic tokens
- [x] 8.2 Remove `space-x-*` / `space-y-*` usages, replace with `flex gap-*`
- [x] 8.3 Ensure no manual `z-index` on overlays (Dialog, Sheet handle their own)
- [x] 8.4 Run `next build` — zero TypeScript errors
- [x] 8.5 Run `next dev` and visually verify all 6 routes: `/`, `/landing`, `/new`, `/history`, `/video/[id]`, `/settings`
- [x] 8.6 Verify responsive behavior on mobile (Navbar Sheet, HistoryTable card view)
- [x] 8.7 Verify accessibility: tab through forms, check `Label` associations

## 9. Documentation

- [x] 9.1 Update `frontend/README.md` (if exists) with shadcn/ui component list
- [x] 9.2 Add comment in `globals.css` explaining dark theme variable mapping
