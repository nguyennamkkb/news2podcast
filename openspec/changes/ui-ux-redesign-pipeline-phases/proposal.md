## Why

The current UI wastes 60-70% of desktop screen space (center-narrow `max-w-2xl`/`max-w-4xl` constraints), uses 5 separate Cards for 5 single-field settings, and critically lacks a Script Review step — users click "Generate Video" and wait 2-5 minutes without knowing if the generated script is correct. This change redesigns the UI to maximize desktop screen utilization, condenses settings, and introduces a phased implementation plan following the documented pipeline flow and UI/UX design proposal.

## What Changes

- **New Video page**: 2-column layout (60/40 editor+config), button renamed "Generate Script", keyboard shortcut Cmd+Enter
- **New Script Review page**: Collapsible slide cards with edit mode, Summary bar, Approve & Create Video / Regenerate Script actions
- **Settings page**: Condensed to 2 Cards (Video Defaults horizontal grid, LLM Provider with test connection)
- **Dashboard**: 4 meaningful stat cards (Total Videos, Avg Duration, In Progress, LLM Status), Recent Videos table with thumbnails and inline progress
- **History page**: Thumbnail column in data table, inline progress bars for processing videos, action menu (⋮)
- **Video Detail page**: 2-column layout (video players left, Slide Breakdown right), metadata row, download buttons
- **All pages**: Remove `max-w-2xl`/`max-w-4xl` constraints, use full sidebar width
- **Sidebar**: Add LLM status indicator (provider + connection state)
- **New components**: `ScriptReview`, `SlideBreakdown`, `VideoThumbnail`, `LLMStatusBadge`
- **Refactored components**: `ConfigPanel` (horizontal layout), `HistoryTable` (thumbnail column), `ProgressTracker` (per-step timing)

## Capabilities

### New Capabilities

- `new-video-layout`: 2-column layout for New Video page (editor 60% + config 40%), Cmd+Enter shortcut
- `script-review`: Script Review & Edit page — view generated slides, edit title/bullets/voiceover, approve or regenerate
- `settings-compact`: Condensed Settings page with 2 Cards (Video Defaults grid, LLM Provider with test connection)
- `dashboard-redesign`: Dashboard with 4 meaningful stat cards, recent videos table with thumbnails, LLM status indicator
- `history-enhanced`: History page with thumbnail column, inline progress, action menu, search/filter in header
- `video-detail-redesign`: 2-column Video Detail (players + Slide Breakdown panel), metadata row
- `full-width-layout`: Remove `max-w-2xl`/`max-w-4xl` constraints across all pages, use full sidebar inset width

### Modified Capabilities

_(No existing specs to modify — this is a new project spec)_

## Impact

- **Frontend files**: All page components (`page.tsx`) in `frontend/src/app/`, most components in `frontend/src/components/`, hooks (`useSettings`, `useGenerateVideo`, `useJobPolling`), and `lib/api.ts`
- **Backend API**: `ScriptReview` requires a new API endpoint or workflow signal (Phase 2 — Temporal pause/resume)
- **Temporal workflow**: Phase 1 auto-approves scripts; Phase 2 adds `pause` signal after `generate_script` for user review
- **Dependencies**: No new npm/pip packages required — uses existing shadcn/ui components
- **Breaking**: The "Generate Video" button text changes to "Generate Script" in Phase 1 — API contract unchanged