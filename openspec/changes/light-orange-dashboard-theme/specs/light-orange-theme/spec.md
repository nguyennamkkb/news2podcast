## ADDED Requirements

### Requirement: Theme uses light orange-white palette
The application SHALL use a light background with orange primary color.

#### Scenario: Background is white
- **WHEN** user views any page
- **THEN** the page background is white (`#ffffff`)

#### Scenario: Primary buttons are orange
- **WHEN** user sees a primary Button
- **THEN** it has an orange background (`hsl(24 95% 53%)`) and white text

#### Scenario: Cards have white background
- **WHEN** user sees a Card component
- **THEN** it has a white background with subtle border/shadow

#### Scenario: Text is dark on light
- **WHEN** user reads any text
- **THEN** body text is near-black (`hsl(20 14% 10%)`) for high contrast

### Requirement: Semantic tokens mapped to orange palette
All shadcn/ui semantic tokens SHALL map to the orange palette.

#### Scenario: Primary token is orange
- **WHEN** inspecting `--primary` CSS variable
- **THEN** it equals `24 95% 53%` (orange)

#### Scenario: Ring token is orange
- **WHEN** focusing an input or button
- **THEN** the focus ring is orange

#### Scenario: Muted token is cream
- **WHEN** viewing muted text or backgrounds
- **THEN** they use warm cream tones (`30 20% 96%`)

### Requirement: Dark mode class preserved for future toggle
The CSS SHALL keep `.dark` variant support even though light is default.

#### Scenario: Dark class exists
- **WHEN** inspecting `globals.css`
- **THEN** a `.dark` selector with dark theme variables is present
