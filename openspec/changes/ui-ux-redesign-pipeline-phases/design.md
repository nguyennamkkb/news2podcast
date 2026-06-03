## Context

News2Video is a text-to-video pipeline tool. Current UI uses `max-w-2xl`/`max-w-4xl` center-narrow constraints on every page, wasting 60-70% of desktop screen space. The "Generate Video" button bypasses script review entirely — users wait 2-5 minutes without seeing the generated script. Settings uses 5 separate Cards for 5 single-field settings, requiring 3+ viewport heights of scrolling. History and Dashboard pages lack thumbnails and visual engagement.

The backend pipeline has 9 Temporal activities (parse → script → TTS → mix → align → render → convert → upload → save). The script generation step is the core value — this is where LLM quality matters most. Video production steps are mechanical and should run automatically after user approval.

Reference docs: `docs/PIPELINE_FLOW.md` (pipeline detail), `docs/UI_UX_REDESIGN_PROPOSAL.md` (UI wireframes and descriptions).

## Goals / Non-Goals

**Goals:**
- Maximize screen utilization on desktop (1280-1920px) by removing center-narrow constraints
- Implement 2-column New Video layout (60/40 editor+config split)
- Rename "Generate Video" to "Generate Script" to correctly label the core action
- Add Script Review page with edit/approve/regenerate flow (Phase 2)
- Condense Settings to 2 Cards (Video Defaults grid + LLM Provider)
- Add dashboard video thumbnails, meaningful stats, and LLM status
- Add History table thumbnails and inline progress
- Add Video Detail Slide Breakdown panel
- Organize all work into 5 phased implementations

**Non-Goals:**
- Mobile-first responsive design (responsive-ready but desktop-priority)
- Changing the backend Temporal workflow in Phase 1 (Script Review requires Phase 2)
- Adding real-time notifications (toasts, browser notifications) — out of scope
- Adding batch processing, template system, or script versioning — future phase
- Changing authentication or multi-user support
- Replacing shadcn/ui components or the component library

## Decisions

### D1: Phase ordering — Core pipeline first

**Decision:** P1 (New Video + Settings) → P2 (Script Review) → P3 (Dashboard) → P4 (Video Detail) → P5 (Keyboard shortcuts + polish)

**Rationale:** P1 gives the biggest UX improvement per effort (2-column layout, button rename). P2 is the most valuable new feature (script review). P3-P5 are incremental improvements.

**Alternatives considered:**
- Bottom-up (polish first) — Low impact, delays most visible improvements
- All-at-once — Too large a change, hard to test incrementally

### D2: Layout approach — Remove max-w constraints, use SidebarInset width

**Decision:** Remove `max-w-2xl` and `max-w-4xl` constraints from all pages. Use `max-w-7xl` where horizontal bounds are needed. New Video uses no max-width (full sidebar inset width).

**Rationale:** The shadcn/ui SidebarInset already provides proper padding. Adding center-narrow constraints wastes desktop space.

**Alternatives considered:**
- CSS Grid templates per page — More flexible but more code
- Keep constraints but widen them (max-w-5xl) — Still wastes space

### D3: Script Review — Separate page vs. inline accordion

**Decision:** Dedicated `/video/[id]` page with Script Review state, not an inline accordion in New Video.

**Rationale:** Script review needs full page space for 4-8 slide cards with edit fields. Inline would be cramped and break the 2-column layout. Using the same URL but different state (processing → review → completed) is cleaner.

**Alternatives considered:**
- Inline accordion below editor — Too cramped, mixes input and output concerns
- Modal dialog — No space for full slide editing

### D4: Script Review implementation — Phase 1 auto-approve, Phase 2 review/approve

**Decision:** Phase 1 auto-approves scripts (current behavior, just UI changes). Phase 2 adds Temporal workflow signal (pause/resume) for user review.

**Rationale:** Workflow signal support requires backend changes (Temporal pause/resume pattern, new API endpoint for approve/reject). Implementing this before the UI is ready would create dead code. Phase 1 gives immediate UX value without backend changes.

### D5: Component architecture — New components for new features

**Decision:** Create `ScriptReview.tsx`, `SlideBreakdown.tsx`, `VideoThumbnail.tsx`, `LLMStatusBadge.tsx`. Refactor `ConfigPanel.tsx` for horizontal layout. Refactor `HistoryTable.tsx` for thumbnails.

**Rationale:** New features need new components. Existing components should be refactored in-place, not duplicated.

## Risks / Trade-offs

- **[Breaking change: button label]** "Generate Video" → "Generate Script" changes user expectations. Mitigation: The API contract is unchanged; only the button text changes. Users now see correct intent.
- **[Phase 2 dependency: Temporal signals]** Script review requires Temporal pause/resume workflow signals. This is a new backend pattern. Mitigation: Phase 1 works without it; Phase 2 adds signals incrementally.
- **[Layout regression]** Removing `max-w` constraints may cause content overflow on some pages. Mitigation: Use `max-w-7xl` as safety bound; test at 1280px and 1920px.
- **[Config panel refactor]** Changing ConfigPanel from vertical to horizontal may break New Video page. Mitigation: Refactor in-place, test with existing e2e flows.
- **[History table thumbnails]** No thumbnail stored for failed/processing videos. Mitigation: Show placeholder icon for missing thumbnails; only show actual thumbnails for completed videos.