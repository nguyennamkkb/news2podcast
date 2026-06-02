## ADDED Requirements

### Requirement: Status displays use Badge
All status indicators across the application SHALL use shadcn `Badge` component with appropriate variants (`default`, `secondary`, `destructive`, `outline`) instead of emoji strings or custom styled spans.

#### Scenario: History table shows video status
- **WHEN** user views `/history` page
- **THEN** video statuses render as `Badge` with variant mapped to status: `completed` → `default`, `processing` → `secondary`, `failed` → `destructive`, `queued` → `outline`

#### Scenario: Recent video row shows status
- **WHEN** user views Dashboard recent videos
- **THEN** each row's status renders as `Badge` instead of emoji icon

#### Scenario: Video detail shows cached badge
- **WHEN** a completed video was served from cache
- **THEN** a `Badge` with `secondary` variant displays "Cached"

### Requirement: Loading states use Skeleton
All loading placeholders SHALL use shadcn `Skeleton` instead of custom `animate-pulse` divs.

#### Scenario: Dashboard stats loading
- **WHEN** dashboard stats are loading
- **THEN** stat cards show `Skeleton` placeholders with rounded shape matching card height

#### Scenario: History table loading
- **WHEN** video list is loading
- **THEN** table rows render as `Skeleton` lines matching table row height

#### Scenario: Recent video row loading
- **WHEN** recent videos are loading on Dashboard
- **THEN** rows render as `Skeleton` avatar + text lines

### Requirement: Data tables use shadcn Table
The HistoryTable SHALL use shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead` instead of raw `<table>` elements.

#### Scenario: History page renders table
- **WHEN** user views `/history`
- **THEN** the video list renders using shadcn `Table` composition

### Requirement: Separators use Separator
All visual dividers SHALL use shadcn `Separator` instead of `<hr>` or `<div className="border-t">`.

#### Scenario: Card content separation
- **WHEN** cards contain multiple content sections
- **THEN** sections are divided by `Separator` with appropriate orientation
