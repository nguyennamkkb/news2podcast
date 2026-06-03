## ADDED Requirements

### Requirement: Settings condensed to 2 Cards
The Settings page SHALL display exactly 2 Cards: "Video Defaults" and "LLM Provider", instead of 5 separate Cards.

#### Scenario: 2 Cards on Settings page
- **WHEN** user navigates to `/settings`
- **THEN** exactly 2 Cards are visible: Video Defaults and LLM Provider

### Requirement: Video Defaults horizontal grid
The Video Defaults Card SHALL arrange its fields (Voice, Format, Slides, Duration, Background Music) in a horizontal CSS grid layout on desktop (≥1024px), not vertically stacked.

#### Scenario: Fields arranged horizontally
- **WHEN** user views Settings on a desktop viewport ≥1024px
- **THEN** Voice, Format, Slides, Duration, and Background Music are arranged in a grid with label above and control below

#### Scenario: Fields stack on mobile
- **WHEN** user views Settings on a viewport <1024px
- **THEN** the fields stack vertically within a single Card

### Requirement: LLM Provider Card with Test Connection
The LLM Provider Card SHALL include provider radio selection, conditional fields (API URL, API Key, Model), and a Test Connection button with result indicator.

#### Scenario: Test Connection success
- **WHEN** user clicks "Test Connection" with valid configuration
- **THEN** a green checkmark with latency appears (e.g., "✓ Connected 1.2s")

#### Scenario: Test Connection failure
- **WHEN** user clicks "Test Connection" with invalid configuration
- **THEN** a red error message appears (e.g., "✗ Cannot connect to https://...")

#### Scenario: API Key input with show/hide toggle
- **WHEN** user focuses on the API Key input
- **THEN** the key text is shown; when focus leaves, the key is masked (****last4)

### Requirement: Reset to Defaults button
The Settings page SHALL include a "Reset to Defaults" button that restores all settings to their default values.

#### Scenario: Reset all settings
- **WHEN** user clicks "Reset to Defaults"
- **THEN** all settings (Voice, Format, Slides, Duration, Provider, API URL, API Key, Model) revert to defaults and a "Settings saved" confirmation appears