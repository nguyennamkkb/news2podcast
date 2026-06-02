## ADDED Requirements

### Requirement: Sidebar renders vertical navigation
The application SHALL render a collapsible left sidebar with navigation items on all pages.

#### Scenario: Desktop sidebar visible
- **WHEN** user views any page on desktop viewport
- **THEN** a fixed left sidebar is visible with navigation items stacked vertically

#### Scenario: Sidebar has icon and label
- **WHEN** user views the sidebar
- **THEN** each nav item shows an icon and a text label

#### Scenario: Active item highlighted
- **WHEN** user is on the Dashboard page
- **THEN** the "Dashboard" nav item has an orange background and white text

### Requirement: Sidebar collapses to icon-only
The sidebar SHALL support a collapsed state showing only icons.

#### Scenario: Toggle collapse
- **WHEN** user clicks the collapse toggle button
- **THEN** sidebar width reduces to 64px and labels are hidden
- **AND** tooltips appear on hover showing the label

#### Scenario: Collapsed sidebar persists
- **WHEN** user collapses the sidebar and navigates to another page
- **THEN** sidebar remains collapsed

### Requirement: Mobile sidebar uses Sheet drawer
On mobile, the sidebar SHALL render as a slide-in drawer.

#### Scenario: Mobile hamburger opens sidebar
- **WHEN** user taps the hamburger icon on mobile
- **THEN** a Sheet slides in from the left containing the full sidebar navigation

#### Scenario: Mobile sidebar closes on navigate
- **WHEN** user taps a nav item in the mobile sidebar
- **THEN** the Sheet closes and navigation occurs
