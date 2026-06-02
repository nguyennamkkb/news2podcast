## ADDED Requirements

### Requirement: Navbar uses Tabs for navigation
The Navbar SHALL use shadcn `Tabs` with `TabsList` and `TabsTrigger` bound to current route, replacing the custom active-state link logic.

#### Scenario: Desktop navigation renders
- **WHEN** user views any page on desktop
- **THEN** the Navbar renders as `Tabs` with 4 triggers: Dashboard, New Video, History, Settings

#### Scenario: Active tab reflects current route
- **WHEN** user navigates to `/history`
- **THEN** the "History" tab has active styling via `Tabs` value binding

#### Scenario: Mobile navigation uses Sheet
- **WHEN** user views on mobile viewport
- **THEN** the hamburger menu opens a shadcn `Sheet` containing `Tabs` navigation

### Requirement: Breadcrumb navigation for nested pages
Pages with parent relationships (`/video/[id]`, `/settings`) SHALL optionally display shadcn `Breadcrumb` showing navigation path back to Dashboard.

#### Scenario: Video detail shows breadcrumb
- **WHEN** user views `/video/abc123`
- **THEN** a `Breadcrumb` displays: Dashboard > Video > (truncated title)
