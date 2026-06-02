## ADDED Requirements

### Requirement: ProgressTracker uses Progress and Badge
The ProgressTracker SHALL use shadcn `Progress` for the progress bar and `Badge` for step status indicators, replacing custom div-based styling.

#### Scenario: Progress bar renders
- **WHEN** user views a processing job at `/video/:id`
- **THEN** the progress bar renders as shadcn `Progress` with `value` bound to job percent

#### Scenario: Step list renders with Badge status
- **WHEN** user views processing steps
- **THEN** each step shows a `Badge` indicating status: `pending` → `outline`, `in_progress` → `secondary`, `completed` → `default`, `failed` → `destructive`

#### Scenario: Progress page header shows status Badge
- **WHEN** job is processing
- **THEN** the page header displays a `Badge` with `secondary` variant reading "Processing"

### Requirement: ProgressTracker uses Stepper for multi-step visualization
The step list SHALL optionally use shadcn `Stepper` (or `Tabs` with vertical orientation) for clearer visual hierarchy of the workflow stages.

#### Scenario: Workflow steps visualized
- **WHEN** user views job progress
- **THEN** the 9 steps (parsing, scripting, tts, aligning, rendering, converting, mixing, uploading, saving) render as a vertical stepper with completed/active/pending states
