## ADDED Requirements

### Requirement: Dashboard uses two-column layout on desktop
The Dashboard SHALL use a two-column layout on desktop screens.

#### Scenario: Desktop layout
- **WHEN** user views Dashboard on desktop (≥1024px)
- **THEN** the left column (2/3 width) contains stat cards and recent videos
- **AND** the right column (1/3 width) contains activity feed or quick stats

#### Scenario: Mobile stacks to single column
- **WHEN** user views Dashboard on mobile (<768px)
- **THEN** all content stacks vertically in a single column

### Requirement: Sidebar does not overlap content
The main content area SHALL have proper margin to account for sidebar width.

#### Scenario: Content offset on desktop
- **WHEN** sidebar is expanded (240px width)
- **THEN** main content has a left margin of 240px

#### Scenario: Content offset on collapsed
- **WHEN** sidebar is collapsed (64px width)
- **THEN** main content has a left margin of 64px
