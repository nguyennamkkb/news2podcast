## ADDED Requirements

### Requirement: Remove max-width constraints from all pages
All pages SHALL use `max-w-7xl` as the maximum content width (where horizontal bounds are needed), and the New Video page SHALL use no maximum width, filling the full sidebar inset width.

#### Scenario: Dashboard uses max-w-7xl
- **WHEN** user views the Dashboard on a 1920px viewport
- **THEN** content fills `max-w-7xl` (80rem / 1280px), not `max-w-2xl`

#### Scenario: New Video uses full width
- **WHEN** user views the New Video page on a 1920px viewport
- **THEN** the 2-column layout (editor + config) fills the entire sidebar inset width with no max-width constraint

#### Scenario: Video Detail uses max-w-7xl
- **WHEN** user views Video Detail on a 1920px viewport
- **THEN** the 2-column layout (players + breakdown) fills `max-w-7xl`

#### Scenario: Settings uses max-w-2xl
- **WHEN** user views the Settings page
- **THEN** the 2 Cards use `max-w-2xl` center alignment (settings look better narrow)

### Requirement: Sidebar inset fills available space
The `SidebarInset` component SHALL fill the full width between the sidebar and the viewport edge, with no additional centering constraints.

#### Scenario: Content fills sidebar inset
- **WHEN** sidebar is expanded (default state)
- **THEN** main content fills from sidebar edge to viewport edge minus standard padding