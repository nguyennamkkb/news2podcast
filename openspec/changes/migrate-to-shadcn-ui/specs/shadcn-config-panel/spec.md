## ADDED Requirements

### Requirement: ConfigPanel uses shadcn composition
The ConfigPanel SHALL be restructured as a shadcn `Card` containing `FieldGroup` + `Field` layouts for each setting, using `Select`, `Slider`, `ToggleGroup`, and `Switch` as appropriate.

#### Scenario: Voice selection renders
- **WHEN** user opens ConfigPanel
- **THEN** voice selection uses `Select` with `Label` "Voice"

#### Scenario: Format toggle renders
- **WHEN** user opens ConfigPanel
- **THEN** format selection uses `ToggleGroup` with 2 items: 9:16 and 16:9

#### Scenario: Duration selection renders
- **WHEN** user opens ConfigPanel
- **THEN** duration uses `ToggleGroup` with 4 items: Auto, 30s, 60s, 90s

#### Scenario: Slide count slider renders
- **WHEN** user opens ConfigPanel
- **THEN** slide count uses `Slider` with min=3, max=8, showing current value in `Label`

#### Scenario: Background music selector renders
- **WHEN** user opens ConfigPanel
- **THEN** background music uses `Switch` toggle with `Label` "Background Music"

### Requirement: BgMusicSelector merges into ConfigPanel
The separate `BgMusicSelector` component SHALL be deprecated; its functionality SHALL be integrated into ConfigPanel as a `Switch` + optional `Select` for track choice when enabled.

#### Scenario: Background music disabled
- **WHEN** user toggles Background Music Switch off
- **THEN** track selection is hidden/disabled

#### Scenario: Background music enabled
- **WHEN** user toggles Background Music Switch on
- **THEN** track selection appears as `Select` with available tracks
