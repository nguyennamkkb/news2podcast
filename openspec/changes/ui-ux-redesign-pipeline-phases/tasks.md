## Phase 1: New Video Layout + Settings Compact (P1)

Highest UX impact. 2-column New Video layout, renamed button, condensed Settings.

- [x] 1.1 Remove `max-w-2xl` and `max-w-4xl` constraints from `/new/page.tsx` — use full SidebarInset width for the 2-column layout
- [x] 1.2 Restructure New Video page into 2-column layout: `<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">` with Content Editor in `lg:col-span-3` and Configuration in `lg:col-span-2`
- [x] 1.3 Move LLM Provider card below the 2-column grid, full-width
- [x] 1.4 Change button text from "Generate Video" to "Generate Script" in `/new/page.tsx`
- [x] 1.5 Add Cmd+Enter / Ctrl+Enter keyboard shortcut handler to submit form in `/new/page.tsx`
- [x] 1.6 Refactor `ConfigPanel.tsx` — single Card with vertical layout for side panel (horizontal grid is for Settings page, handled in 1.7)
- [x] 1.7 Condense Settings page from 5 Cards to 2: "Video Defaults" (horizontal grid) + "LLM Provider" (with test connection). Keep LLM test functionality.
- [x] 1.8 Add `VideoThumbnail.tsx` component — renders 56px thumbnail for completed videos, spinner for processing, error icon for failed
- [x] 1.9 Verify: LSP diagnostics pass on all changed files, Docker backend restarts clean, `/new` and `/settings` pages render at 200

## Phase 2: Script Review Page (P2)

New Script Review state in Video Detail. Requires Temporal workflow signal for Phase 2 full implementation; Phase 1 auto-approve remains.

- [x] 2.1 Create `ScriptReview.tsx` component — collapsible slide cards with title, bullets, voiceover, duration per slide
- [x] 2.2 Add edit mode toggle (✏️ button) to ScriptReview — converts fields to editable inputs (title, bullets list with add/remove, voiceover textarea, duration number)
- [x] 2.3 Add Summary Bar to ScriptReview — "X slides · Ys total · Language · Format · Voice"
- [x] 2.4 Add "Regenerate Script" and "Approve & Create Video" buttons below ScriptReview
- [x] 2.5 Update `/video/[id]/page.tsx` — add Script Review state between processing and completed: when `status === 'awaiting_review'` and `script_data` exists, show ScriptReview
- [x] 2.6 Phase 1 fallback: In `/video/[id]/page.tsx`, when `status === 'processing'` auto-approve (show ProgressTracker directly). Script Review only shows on `awaiting_review` status.
- [x] 2.7 Add Temporal workflow signal support: `NewsToVideoWorkflow` pauses after `generate_script` step, waits for `approve_script` or `reject_script` signal
- [x] 2.8 Add API endpoint `POST /api/v1/jobs/{id}/approve-script` and `POST /api/v1/jobs/{id}/reject-script` to send Temporal signals
- [x] 2.9 Wire "Approve & Create Video" button to call approve-script API, "Regenerate Script" to call reject-script API
- [x] 2.10 Verify: Script Review renders with mock slide data, edit mode toggles, buttons call correct endpoints

## Phase 3: Dashboard Redesign (P3)

Replace filler stat cards, add thumbnails, LLM status indicator.

- [x] 3.1 Update Dashboard `/page.tsx` — replace "Cost $0.00" and "Voice: Free" cards with "In Progress" (active job count) and "LLM Status" (provider + model name)
- [x] 3.2 Create `LLMStatusBadge.tsx` component — shows provider name, model, and connection state (connected/disconnected)
- [x] 3.3 Add `useLLMStatus` hook — calls `GET /api/v1/llm/test` to check connection and returns provider, model, latency
- [x] 3.4 Replace `RecentVideoRow` list with enhanced table using `VideoThumbnail` component for thumbnail column
- [x] 3.5 Add actions menu (⋮) to each video row with View, Download 9:16, Download 16:9, Delete options
- [x] 3.6 Add inline progress bar for processing videos in the recent videos table
- [x] 3.7 Verify: Dashboard renders with 4 meaningful stat cards, recent videos table has thumbnails

## Phase 4: Video Detail Redesign (P4)

2-column layout, Slide Breakdown panel, metadata row.

- [x] 4.1 Restructure `/video/[id]/page.tsx` completed state into 2-column: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- [x] 4.2 Left column: stack 9:16 video (small) above 16:9 video
- [x] 4.3 Create `SlideBreakdown.tsx` component — lists slides with number, title, bullets, duration; expandable sections
- [x] 4.4 Right column: SlideBreakdown panel with click-to-seek on video player
- [x] 4.5 Add metadata row below players: Title, Slides, Duration (MM:SS), Created timestamp
- [x] 4.6 Update download buttons: "Download 9:16", "Download 16:9", "Regenerate"
- [x] 4.7 Verify: Video Detail shows 2-column layout on desktop, stacked on mobile, SlideBreakdown lists correct data

## Phase 5: History Enhanced (P3)

Add thumbnails, inline progress, search/filter in header, actions menu.

- [x] 5.1 Move search input and status filter from inside `HistoryTable` Card to the page header area (right side of breadcrumb)
- [x] 5.2 Update `HistoryTable.tsx` — add `VideoThumbnail` column as first column (56px)
- [x] 5.3 Add inline progress bar for processing videos in History table rows
- [x] 5.4 Add ⋮ actions dropdown menu per row: View, Download 9:16, Download 16:9, Delete
- [x] 5.5 Update pagination to be more compact (prev/next buttons with page numbers)
- [x] 5.6 Verify: History page renders with thumbnails, search/filter in header, actions menu works

## Phase 6: Full-Width Layout + Polish (P5)

Remove `max-w` constraints across all pages, add keyboard shortcuts, LLM status in sidebar.

- [x] 6.1 Remove `max-w-2xl` from Settings page, keep `max-w-2xl` as intentional narrow layout
- [x] 6.2 Remove `max-w-4xl` from Video Detail processing state, use `max-w-7xl`
- [x] 6.3 Ensure Dashboard uses `max-w-7xl`
- [x] 6.4 Ensure History page uses `max-w-7xl` for the table
- [x] 6.5 Add LLM status indicator to `AppSidebar.tsx` footer — shows provider name and connected/disconnected state
- [x] 6.6 Add keyboard shortcut hints in UI: tooltip on "Generate Script" button showing ⌘↵
- [x] 6.7 Verify: All pages use full width appropriately, no excessive center-narrow constraints