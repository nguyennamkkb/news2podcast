## ADDED Requirements

### Requirement: Dashboard displays stat cards
The Dashboard SHALL display a row of stat cards showing key metrics.

#### Scenario: Stat cards visible
- **WHEN** user visits the Dashboard
- **THEN** 3 stat cards are visible in a row: Videos Created, Avg Duration, Cost Estimate

#### Scenario: Stat card shows icon and value
- **WHEN** user views a stat card
- **THEN** it displays an icon, a numeric value, and a label

#### Scenario: Stat card loading state
- **WHEN** data is loading
- **THEN** stat cards show Skeleton placeholders

### Requirement: Dashboard has recent activity section
The Dashboard SHALL display a list of recent video generation jobs.

#### Scenario: Recent videos list
- **WHEN** user views the Dashboard
- **THEN** a "Recent Videos" section shows the last 5 videos with title, status badge, and timestamp

#### Scenario: Empty state
- **WHEN** no videos exist
- **THEN** an empty state message and "Create Video" CTA button are shown

### Requirement: Dashboard has quick action buttons
The Dashboard SHALL provide prominent quick action buttons.

#### Scenario: New Video CTA
- **WHEN** user views the Dashboard
- **THEN** a large orange "+ New Video" button is prominently displayed

#### Scenario: View All link
- **WHEN** user views the Dashboard
- **THEN** a "View all" link navigates to the History page
