## ADDED Requirements

### Requirement: Dashboard meaningful stat cards
The Dashboard SHALL display exactly 4 stat cards in a row: Total Videos, Average Duration, In Progress (with processing count), and LLM Status (provider name, model, and connection state).

#### Scenario: 4 stat cards
- **WHEN** user navigates to `/` (Dashboard)
- **THEN** 4 cards are displayed in a row: Total Videos (count), Average Duration (M:SS), In Progress (count), LLM Status (provider·model · Connected/Disconnected)

#### Scenario: LLM Status card is clickable
- **WHEN** user clicks the LLM Status card
- **THEN** navigation goes to `/settings`

### Requirement: Recent Videos table with thumbnails
The Recent Videos section SHALL display a table with thumbnail column (56px wide), title, duration, status badge, and actions menu (⋮).

#### Scenario: Video thumbnail in table
- **WHEN** a completed video has a thumbnail URL
- **THEN** a 56px-wide thumbnail image is displayed in the first column

#### Scenario: Processing video shows progress
- **WHEN** a video is in processing state
- **THEN** the thumbnail area shows a spinner/progress indicator instead of a thumbnail

#### Scenario: Failed video shows placeholder
- **WHEN** a video is in failed state
- **THEN** the thumbnail area shows an error icon placeholder

### Requirement: Actions menu on each video row
Each video row SHALL have a ⋮ menu with actions: View, Download 9:16, Download 16:9, and Delete.

#### Scenario: Open actions menu
- **WHEN** user clicks the ⋮ button on a video row
- **THEN** a dropdown menu appears with View, Download 9:16, Download 16:9, Delete actions

#### Scenario: Download action
- **WHEN** user clicks "Download 9:16" from the actions menu
- **THEN** the 9:16 video file downloads

### Requirement: New Video button in header
The Dashboard page header SHALL include a "New Video" button with a Plus icon.

#### Scenario: Navigate to New Video
- **WHEN** user clicks the "New Video" button in the Dashboard header
- **THEN** navigation goes to `/new`