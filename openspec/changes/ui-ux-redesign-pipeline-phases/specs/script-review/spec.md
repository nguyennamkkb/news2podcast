## ADDED Requirements

### Requirement: Script Review page displays generated slides
After script generation completes, the Video Detail page SHALL display a Script Review state showing all generated slides as collapsible cards with title, bullets, voiceover, and duration.

#### Scenario: Script review after generation
- **WHEN** a job completes the `generate_script` step and the workflow supports review
- **THEN** the `/video/[id]` page displays a Script Review panel with all slides as collapsible cards

#### Scenario: Each slide shows key information
- **WHEN** user views the Script Review panel
- **THEN** each slide card shows: slide number, role label (Hook/Main/Analysis/CTA), title, and duration

### Requirement: Slide expand/collapse
Each slide card SHALL be expandable to show the full content (title, bullets, voiceover text) and collapsible to show only the summary line.

#### Scenario: Expand a slide
- **WHEN** user clicks on a collapsed slide card
- **THEN** the card expands to show title (editable), bullets (editable), voiceover (editable), and duration

#### Scenario: Collapse a slide
- **WHEN** user clicks on an expanded slide card header
- **THEN** the card collapses to show only slide number, title, and duration

### Requirement: Script edit mode
The Script Review panel SHALL provide an edit mode that converts slide fields into editable inputs.

#### Scenario: Toggle edit mode
- **WHEN** user clicks the edit (✏️) button on the Script Review panel
- **THEN** all slide fields (title, bullets, voiceover) become editable inputs

#### Scenario: Edit a slide title
- **WHEN** user modifies a slide title in edit mode and clicks outside the input
- **THEN** the change is saved to the local state

#### Scenario: Add a bullet point
- **WHEN** user clicks "Add bullet" button on a slide in edit mode
- **THEN** a new empty bullet input field appears at the end of the bullets list

#### Scenario: Remove a bullet point
- **WHEN** user clicks the remove (×) button on a bullet input
- **THEN** that bullet is removed from the slide

### Requirement: Script summary bar
The Script Review panel SHALL display a Summary Bar showing: slide count, estimated total duration, language, format, and voice name.

#### Scenario: Summary displays correct information
- **WHEN** user views the Script Review panel
- **THEN** a summary bar shows "X slides · Ys total · Language · Format · Voice"

### Requirement: Approve and Create Video action
The Script Review panel SHALL provide an "Approve & Create Video" button that continues the pipeline from TTS onward.

#### Scenario: Approve script and continue
- **WHEN** user clicks "Approve & Create Video"
- **THEN** the pipeline continues from the TTS step, and the page transitions to the Processing state with ProgressTracker

### Requirement: Regenerate Script action
The Script Review panel SHALL provide a "Regenerate Script" button that re-runs the LLM with the same or modified content.

#### Scenario: Regenerate script
- **WHEN** user clicks "Regenerate Script"
- **THEN** a confirmation dialog appears; on confirm, a new `generate_script` call is made and the Script Review panel updates with new slides

### Requirement: Phase 1 auto-approve fallback
In Phase 1 (before Temporal workflow signal support is implemented), the system SHALL auto-approve scripts and transition directly from script generation to the Processing state, maintaining current behavior.

#### Scenario: Auto-approve in Phase 1
- **WHEN** script generation completes and workflow signals are not yet implemented
- **THEN** the job automatically proceeds to TTS without user review, and the page shows ProgressTracker