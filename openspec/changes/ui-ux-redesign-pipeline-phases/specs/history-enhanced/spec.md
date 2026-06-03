## ADDED Requirements

### Requirement: Thumbnail column in History table
The History table SHALL include a thumbnail column (56px wide) as the first column, showing video thumbnails for completed videos.

#### Scenario: Completed video thumbnail
- **WHEN** a completed video has a thumbnail URL
- **THEN** the thumbnail column displays a 56px-wide image

#### Scenario: No thumbnail for processing/failed
- **WHEN** a video is in processing or failed state
- **THEN** the thumbnail column shows a placeholder icon (spinner for processing, error icon for failed)

### Requirement: Inline progress bars for processing videos
Videos that are currently processing SHALL display an inline progress bar in the table row instead of a static "processing" badge.

#### Scenario: Processing video shows progress
- **WHEN** a video has status "processing" with progress data
- **THEN** the table row shows a progress bar with percentage and current step name

### Requirement: Search and filter in header
The search input and status filter SHALL be displayed in the page header area (right side of breadcrumb), not inside the table Card.

#### Scenario: Search in header
- **WHEN** user types in the search input in the header
- **THEN** the table filters results in real-time (debounced 300ms)

#### Scenario: Status filter dropdown
- **WHEN** user selects a status from the filter dropdown
- **THEN** the table shows only videos with that status

### Requirement: Actions menu per row
Each video row SHALL have a ⋮ dropdown menu with: View, Download 9:16, Download 16:9, and Delete.

#### Scenario: Actions menu
- **WHEN** user clicks ⋮ on a row
- **THEN** a dropdown appears with View, Download 9:16, Download 16:9, Delete options