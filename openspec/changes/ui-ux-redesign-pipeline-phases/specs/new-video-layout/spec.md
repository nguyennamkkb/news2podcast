## ADDED Requirements

### Requirement: New Video 2-column layout
The New Video page SHALL display a 2-column layout where the Content Editor occupies 60% of the available width and the Configuration panel occupies 40%.

#### Scenario: Desktop viewport shows 2 columns
- **WHEN** user navigates to `/new` on a viewport ≥1024px wide
- **THEN** Content Editor and Configuration panel are displayed side-by-side, not stacked vertically

#### Scenario: Mobile viewport stacks columns
- **WHEN** user navigates to `/new` on a viewport <1024px wide
- **THEN** Content Editor and Configuration panel stack vertically (editor on top, config below)

### Requirement: Content Editor fills remaining height
The Content Editor textarea SHALL fill the available vertical space using `calc(100vh - 300px)` minimum height, eliminating excessive whitespace.

#### Scenario: Textarea fills viewport
- **WHEN** user opens the New Video page on a 1080px tall viewport
- **THEN** the textarea height is at least `calc(100vh - 300px)`, using the majority of vertical space

### Requirement: Configuration panel single Card
All configuration fields (Voice, Format, Slides, Duration, Background Music) SHALL be contained in a single Card component with Divider separators between fields, instead of 5 separate Cards.

#### Scenario: All config fields in one Card
- **WHEN** user views the Configuration panel
- **THEN** Voice, Format, Slides, Duration, and Background Music are in one Card, separated by `<Separator />` dividers

### Requirement: Generate Script button label
The primary action button SHALL display "Generate Script" instead of "Generate Video", reflecting the actual action (LLM script generation, not video rendering).

#### Scenario: Button text shows correct action
- **WHEN** user views the New Video page
- **THEN** the primary action button displays "Generate Script" with a sparkle icon

### Requirement: Cmd+Enter keyboard shortcut
The New Video page SHALL submit the form when the user presses Cmd+Enter (macOS) or Ctrl+Enter (Windows/Linux).

#### Scenario: Submit via keyboard shortcut
- **WHEN** user presses Cmd+Enter or Ctrl+Enter while focused on the Content Editor
- **THEN** the form submits (equivalent to clicking "Generate Script")

### Requirement: LLM provider row below editor
The LLM provider selection, conditional fields (API URL, API key, model), and Test Connection button SHALL be displayed in a full-width row below the 2-column editor/config layout, not inside the Configuration panel.

#### Scenario: LLM provider below editor
- **WHEN** user views the New Video page
- **THEN** LLM Provider card appears below the 2-column layout, spanning full width