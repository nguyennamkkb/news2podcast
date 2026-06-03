## ADDED Requirements

### Requirement: 2-column Video Detail layout
The completed Video Detail page SHALL display a 2-column layout: video players (left column) and Slide Breakdown panel (right column).

#### Scenario: Desktop 2-column layout
- **WHEN** user views a completed video on a viewport ≥1024px
- **THEN** the left column shows 9:16 and 16:9 video players stacked, and the right column shows the Slide Breakdown panel

#### Scenario: Mobile stacked layout
- **WHEN** user views a completed video on a viewport <1024px
- **THEN** the players and breakdown panel stack vertically

### Requirement: Slide Breakdown panel
The Slide Breakdown panel SHALL list all slides with: slide number, title, bullet points, duration, and allow click-to-seek on the video player.

#### Scenario: View slide details
- **WHEN** user views the Slide Breakdown panel
- **THEN** each slide shows: number, title, 2-3 bullet points, and duration in seconds

#### Scenario: Click slide to seek video
- **WHEN** user clicks on a slide in the Breakdown panel
- **THEN** the video player seeks to the timestamp where that slide begins

### Requirement: Metadata row
The completed Video Detail page SHALL display a metadata row below the video players showing: Title, Slides count, Duration (MM:SS), and Created timestamp.

#### Scenario: Metadata display
- **WHEN** user views a completed video
- **THEN** a metadata row shows: Title (truncated if long), Slide count, Duration (MM:SS format), and Created time

### Requirement: Download and Regenerate actions
Below the metadata row, the page SHALL display: Download 9:16, Download 16:9, and Regenerate buttons.

#### Scenario: Download buttons
- **WHEN** user clicks "Download 9:16"
- **THEN** the 9:16 MP4 file downloads

#### Scenario: Regenerate button
- **WHEN** user clicks "Regenerate"
- **THEN** navigation goes to `/new` with option to reuse settings