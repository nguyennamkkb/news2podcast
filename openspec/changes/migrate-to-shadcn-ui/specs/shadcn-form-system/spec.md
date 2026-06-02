## ADDED Requirements

### Requirement: Form inputs use shadcn/ui primitives
All form inputs across the application SHALL use shadcn/ui `Input`, `Textarea`, `Select`, `Switch`, `Slider`, and `ToggleGroup` components rather than raw HTML elements.

#### Scenario: Content editor uses Textarea
- **WHEN** user visits `/new` page
- **THEN** the content editor renders as a shadcn `Textarea` with associated `Label`

#### Scenario: Config panel uses Select for voice
- **WHEN** user views voice selection in ConfigPanel
- **THEN** voice options render in a shadcn `Select` with `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem`

#### Scenario: Config panel uses Slider for slide count
- **WHEN** user adjusts slide count
- **THEN** the control renders as a shadcn `Slider` with min=3, max=8, step=1

#### Scenario: Config panel uses ToggleGroup for format
- **WHEN** user switches between 9:16 and 16:9 format
- **THEN** format selection uses `ToggleGroup` with `ToggleGroupItem` instead of manually styled Button

#### Scenario: Config panel uses Switch for background music
- **WHEN** user toggles background music on/off
- **THEN** the control renders as a shadcn `Switch` with associated `Label`

### Requirement: Form validation follows shadcn patterns
All forms SHALL use `FieldGroup` + `Field` composition with `Label`, `FieldDescription`, and `FieldMessage` for validation states. Invalid fields SHALL use `data-invalid` on `Field` and `aria-invalid` on the control.

#### Scenario: Content too short shows validation error
- **WHEN** user submits content with fewer than 10 words
- **THEN** the Textarea field displays `data-invalid` styling and an error message via `FieldMessage`

#### Scenario: Form labels are accessible
- **WHEN** a screen reader focuses a form control
- **THEN** the associated `Label` is announced via `htmlFor` / `aria-labelledby`
