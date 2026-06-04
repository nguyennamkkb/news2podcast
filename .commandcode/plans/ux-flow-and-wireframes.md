# UX Flow & Wireframes

## 1. User Journey Map

```
┌───────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Dashboard │    │  Create New   │    │  Generate &  │    │ Edit &      │    │ Export   │
│ (Empty)   │───▶│  Project      │───▶│  View Script │───▶│ Refine      │───▶│ JSON     │
│           │    │               │    │              │    │ Script      │    │          │
└───────────┘    └──────────────┘    └──────────────┘    └─────────────┘    └──────────┘
```

### Step-by-step

| Step | Screen | User Action | System Response | State |
|------|--------|-------------|-----------------|-------|
| 1 | `/dashboard` | Xem dashboard | Hiển thị stats + project list (empty nếu mới) | Empty |
| 2 | `/projects/new` | Điền form: title, prompt, duration, style | Validate form → enable Submit | Filling |
| 3 | `/projects/[id]` | Click "Generate Script" | SSE stream: researching → generating → validating → done | Generating |
| 4 | `/projects/[id]` | Xem timeline slide-by-slide | Render SlideCards theo timeline | Completed |
| 5 | `/projects/[id]` | Click edit 1 slide → sửa content → save | PATCH project scriptData → invalidate query | Editing |
| 6 | `/projects/[id]` | Click "Export" → Download JSON | Trả file `.json` download | Exporting |

---

## 2. Wireframes

---

### 2.1 Dashboard (Empty) — `/dashboard`

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Dashboard                                    [+ New Project]│
│ Side │  ─────────────────────────────────────────────────────── │
│ bar  │                                                          │
│      │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  D   │  │ 0        │  │ 0        │  │ 0 min    │              │
│  a   │  │ Projects │  │ This Mo  │  │ Avg      │              │
│  s   │  └──────────┘  └──────────┘  └──────────┘              │
│  h   │                                                          │
│  b   │  ┌──────────────────────────────────────────────────┐   │
│  o   │  │                                                  │   │
│  a   │  │              📋  No projects yet                 │   │
│  r   │  │                                                  │   │
│  d   │  │     Create your first video script project       │   │
│      │  │     with AI-powered generation.                  │   │
│  P   │  │                                                  │   │
│  r   │  │     ┌──────────────────────┐                     │   │
│  o   │  │     │   + Create Project   │                     │   │
│  j   │  │     └──────────────────────┘                     │   │
│  e   │  │                                                  │   │
│  c   │  └──────────────────────────────────────────────────┘   │
│  t   │                                                          │
│  s   │                                                          │
│      │                                                          │
│  S   │                                                          │
│  e   │                                                          │
│  t   │                                                          │
│      │                                                          │
│──────┴──────────────────────────────────────────────────────────│
│  User Avatar ▼                                                 │
└────────────────────────────────────────────────────────────────┘
```

**States:**
- Empty: Như wireframe trên
- Has projects: Grid 3 cột ProjectCard thay vì empty state
- Loading: 3 skeleton cards

---

### 2.3 Dashboard (With Projects) — `/dashboard`

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Dashboard                           🔍 Search...   [+ New]│
│      │  ─────────────────────────────────────────────────────── │
│      │  [All] [Draft] [Generating] [Completed]                  │
│      │                                                          │
│      │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│      │  │ AI Video Tips │ │ Product Intro │ │ Tutorial #1   │  │
│      │  │ ──────────── │ │ ──────────── │ │ ──────────── │  │
│      │  │ ✅ Completed  │ │ 🔵 Generating│ │ 📝 Draft      │  │
│      │  │               │ │               │ │               │  │
│      │  │ 12 slides     │ │ ...           │ │ 0 slides      │  │
│      │  │ 5 min         │ │ 3 min target  │ │ 2 min target  │  │
│      │  │               │ │               │ │               │  │
│      │  │ 2 days ago    │ │ Just now      │ │ 1 week ago    │  │
│      │  │     ⋯         │ │     ⋯         │ │     ⋯         │  │
│      │  └───────────────┘ └───────────────┘ └───────────────┘  │
│      │                                                          │
│      │  ┌───────────────┐ ┌───────────────┐                    │
│      │  │ News Recap    │ │ ...           │                    │
│      │  │ ──────────── │ │               │                    │
│      │  │ ❌ Failed     │ │               │                    │
│      │  │               │ │               │                    │
│      │  │ ---           │ │               │                    │
│      │  │ 5 min target  │ │               │                    │
│      │  │               │ │               │                    │
│      │  │ 3 days ago    │ │               │                    │
│      │  │     ⋯         │ │               │                    │
│      │  └───────────────┘ └───────────────┘                    │
│      │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**ProjectCard variants:**
- DRAFT: gray border, 📝 icon
- GENERATING: blue border, pulsating 🔵 icon
- COMPLETED: green border, ✅ icon
- FAILED: red border, ❌ icon

**Filters:** Tabs All | Draft | Generating | Completed | Failed — lọc theo status

**Search:** Input search theo title

---

### 2.4 Create New Project — `/projects/new`

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Projects > New Project                                   │
│      │  ─────────────────────────────────────────────────────── │
│      │                                                          │
│      │  ┌──────────────────────────────────────────────────┐   │
│      │  │                                                  │   │
│      │  │  Create Video Script                             │   │
│      │  │  ─────────────────────────────────────────────    │   │
│      │  │                                                  │   │
│      │  │  Title *                                         │   │
│      │  │  ┌──────────────────────────────────────────┐   │   │
│      │  │  │ e.g. "5 tips to improve productivity"     │   │   │
│      │  │  └──────────────────────────────────────────┘   │   │
│      │  │                                                  │   │
│      │  │  Requirements / Prompt *                         │   │
│      │  │  ┌──────────────────────────────────────────┐   │   │
│      │  │  │ Describe what you want the video script   │   │   │
│      │  │  │ to cover...                              │   │   │
│      │  │  │                                          │   │   │
│      │  │  │ e.g. "Create an engaging 3-minute        │   │   │
│      │  │  │  explainer video about the benefits      │   │   │
│      │  │  │  of remote work. Include statistics       │   │   │
│      │  │  │  and practical tips. Use a                │   │   │
│      │  │  │  professional but friendly tone."         │   │   │
│      │  │  │                                          │   │   │
│      │  │  └──────────────────────────────────────────┘   │   │
│      │  │                                                  │   │
│      │  │  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │   │
│      │  │  │ Duration ▼  │ │ Style ▼     │ │ Platform ▼│ │   │
│      │  │  │ 3 minutes   │ │ Professional│ │ YouTube   │ │   │
│      │  │  └─────────────┘ └─────────────┘ └───────────┘ │   │
│      │  │                                                  │   │
│      │  │  ┌─────────────┐ ┌─────────────┐                │   │
│      │  │  │ Visual  ▼   │ │ Language ▼  │                │   │
│      │  │  │ Cinematic   │ │ Tiếng Việt  │                │   │
│      │  │  └─────────────┘ └─────────────┘                │   │
│      │  │                                                  │   │
│      │  │  ┌──────────────────────────────────────┐       │   │
│      │  │  │        ⚡ Create & Generate           │       │   │
│      │  │  └──────────────────────────────────────┘       │   │
│      │  │                                                  │   │
│      │  └──────────────────────────────────────────────────┘   │
│      │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**Form validation:**
- Title: required, max 300 chars
- Prompt: required, min 10 chars
- Duration: select (1, 2, 3, 5, 10, 15, 30 min)
- Style: Professional | Casual | Educational | Marketing | Storytelling
- Platform: YouTube | TikTok | Facebook | Generic
- Visual: Cinematic | Realistic | Flat Illustration | Minimalist | Infographic
- Language: Tiếng Việt | English

**States:**
- Filling: Form editable
- Validating: Real-time validation errors dưới mỗi field
- Submitting: Button disabled + spinner, redirect đến project page

---

### 2.5 Script Viewer — `/projects/[id]`

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Projects > 5 Tips to Improve Productivity                │
│      │  ─────────────────────────────────────────────────────── │
│      │                                                          │
│      │  ┌────────────────────────────────────────────────┐     │
│      │  │ ✅ Completed · 12 slides · 5 min · gpt-4o       │     │
│      │  │                              [Regenerate][Export]│     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                          │
│      │  [Timeline]  [Slides]  [JSON]  [Versions]               │
│      │  ────────────────────────────────────────────────       │
│      │                                                          │
│      │  ●──── slide-1 ──── 00:00 - 00:30 ──── INTRO            │
│      │  │  ┌─────────────────────────────────────────────┐     │
│      │  │  │ 🎬 Hook: Why Remote Work Matters             │     │
│      │  │  │ ──────────────────────────────────────────  │     │
│      │  │  │ Content preview...                           │     │
│      │  │  │                                              │     │
│      │  │  │ 🖼  Visual: Modern office with split screen  │     │
│      │  │  │ 💬  Subtitle: "Làm việc từ xa..."           │     │
│      │  │  │ ⏱  30s · 🌊 fade                             │     │
│      │  │  │                                    [Edit]    │     │
│      │  │  └─────────────────────────────────────────────┘     │
│      │  │                                                      │
│      │  ●──── slide-2 ──── 00:30 - 00:55 ──── CONTENT         │
│      │  │  ┌─────────────────────────────────────────────┐     │
│      │  │  │ 📊 The Statistics                            │     │
│      │  │  │ ──────────────────────────────────────────  │     │
│      │  │  │ Content preview...                           │     │
│      │  │  │                                    [Edit]    │     │
│      │  │  └─────────────────────────────────────────────┘     │
│      │  │                                                      │
│      │  ●──── slide-3 ──── 00:55 - 01:20 ──── CONTENT         │
│      │  │  ...                                                 │
│      │  │                                                      │
│      │  ●──── slide-12 ─── 04:30 - 05:00 ──── OUTRO           │
│      │     ┌─────────────────────────────────────────────┐     │
│      │     │ 👋 Summary & Call to Action                  │     │
│      │     │                                    [Edit]    │     │
│      │     └─────────────────────────────────────────────┘     │
│      │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**Tab Timeline:**
- Vertical timeline với đường nối
- Mỗi node = slide number + type badge
- SlideCard hiển thị: title, content, visual, subtitle, duration, transition
- Nút Edit mở inline editor

**Tab Slide Editor:**
```
┌──────────────────────────────────────────────────────────┐
│  Edit Slide 3 ────────────────────────── [Save] [Cancel] │
│                                                          │
│  Title                                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ The Statistics                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Content                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ According to recent studies, remote work has...   │   │
│  │                                                  │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Subtitle                                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Các nghiên cứu gần đây cho thấy...               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Visual Description                                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Animated infographic showing statistics with     │   │
│  │ bar charts and percentage numbers                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────┐ ┌──────────────────┐                   │
│  │ Duration ▼  │ │ Transition ▼     │                   │
│  │ 25s         │ │ slide_left       │                   │
│  └─────────────┘ └──────────────────┘                   │
│                                                          │
│  Notes                                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Use official sources for statistics              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Tab JSON:**
```
┌──────────────────────────────────────────────────────────┐
│  Raw JSON ─────────────────────────── [Copy] [Download]  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ {                                                │   │
│  │   "version": "1.0",                              │   │
│  │   "title": "5 Tips to Improve Productivity",     │   │
│  │   "totalDuration": 300,                          │   │
│  │   "language": "vi",                              │   │
│  │   "visualStyle": "cinematic",                    │   │
│  │   "targetPlatform": "youtube",                   │   │
│  │   "slides": [                                    │   │
│  │     {                                            │   │
│  │       "id": "slide-1",                           │   │
│  │       "type": "intro",                           │   │
│  │       "title": "Hook: Why Remote Work Matters",  │   │
│  │       ...                                        │   │
│  │     }                                            │   │
│  │   ]                                              │   │
│  │ }                                                │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Tab Versions:**
```
┌──────────────────────────────────────────────────────────┐
│  Version History                                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  v3 · 2 hours ago · "Updated slide 5 content"     │   │
│  │  ──────────────────────────────────────────────   │   │
│  │  12 slides · 5:00 min                    [Restore]│   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  v2 · 1 day ago · "Fixed subtitle timing"         │   │
│  │  ──────────────────────────────────────────────   │   │
│  │  12 slides · 4:55 min                    [Restore]│   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  v1 · 2 days ago · "Initial AI generation"        │   │
│  │  ──────────────────────────────────────────────   │   │
│  │  12 slides · 5:00 min                    [Restore]│   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

### 2.6 Generate Progress Screen — Trong Script Viewer (GENERATING state)

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Projects > 5 Tips to Improve Productivity                │
│      │  ─────────────────────────────────────────────────────── │
│      │                                                          │
│      │  ┌────────────────────────────────────────────────┐     │
│      │  │ 🔵 Generating · estimated 30-60s                │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                          │
│      │  ┌──────────────────────────────────────────────────┐   │
│      │  │                                                  │   │
│      │  │         ┌────────────────────────────┐          │   │
│      │  │         │   🔬 Researching topic     │          │   │
│      │  │         │   ─────────────────────    │          │   │
│      │  │         │   Analyzing your prompt    │          │   │
│      │  │         │   and gathering context... │          │   │
│      │  │         └────────────────────────────┘          │   │
│      │  │                                                  │   │
│      │  │         ┌────────────────────────────┐          │   │
│      │  │         │   ✍️  Generating script    │          │   │
│      │  │         │   ─────────────────────    │          │   │
│      │  │         │   Creating slides with     │          │   │
│      │  │         │   visual descriptions...   │          │   │
│      │  │         └────────────────────────────┘          │   │
│      │  │                                                  │   │
│      │  │         ┌────────────────────────────┐          │   │
│      │  │         │   ✅ Validating output     │          │   │
│      │  │         │   ─────────────────────    │          │   │
│      │  │         │   Ensuring JSON structure  │          │   │
│      │  │         │   is valid...              │          │   │
│      │  │         └────────────────────────────┘          │   │
│      │  │                                                  │   │
│      │  │  ┌──────────────────────────────────────┐       │   │
│      │  │  │ ████████████████░░░░░░░░░░░░  60%    │       │   │
│      │  │  └──────────────────────────────────────┘       │   │
│      │  │                                                  │   │
│      │  └──────────────────────────────────────────────────┘   │
│      │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**Generation states (SSE events):**
1. `queued` — "🕐 Queued: waiting for available slot..."
2. `researching` — "🔬 Researching topic..."
3. `generating` — "✍️ Generating script..."
4. `validating` — "✅ Validating output..."
5. `completed` — Chuyển sang Timeline view
6. `error` — "❌ Generation failed: ..." + nút "Retry"

---

### 2.7 Queue Full — Dashboard State

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Dashboard                           [+ New] (disabled)    │
│ Side │  ─────────────────────────────────────────────────────── │
│ bar  │                                                          │
│      │  ┌──────────────────────────────────────────────────┐   │
│  ⚡3/5│  │ ⚡ Generation Slots                               │   │
│      │  │                                                  │   │
│      │  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                  │   │
│      │  │  │ ● │ │ ● │ │ ● │ │ ○ │ │ ○ │  3/5 slots used  │   │
│      │  │  └───┘ └───┘ └───┘ └───┘ └───┘                  │   │
│      │  │  ───────────────────────────────────────         │   │
│      │  │  Queue: 1 project waiting                        │   │
│      │  └──────────────────────────────────────────────────┘   │
│      │                                                          │
│      │  [All] [Draft] [Queued] [Generating] [Completed] [Failed]│
│      │                                                          │
│      │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│      │  │ AI Video Tips │ │ Product Intro │ │ Tutorial #1   │  │
│      │  │ ──────────── │ │ ──────────── │ │ ──────────── │  │
│      │  │ ✅ Completed  │ │ 🔵 Generating│ │ 🕐 Queued     │  │
│      │  │               │ │               │ │               │  │
│      │  │ 12 slides     │ │ ...           │ │ Waiting in    │  │
│      │  │ 5 min         │ │ 3 min target  │ │ line...       │  │
│      │  │     ⋯         │ │     ⋯         │ │     ⋯         │  │
│      │  └───────────────┘ └───────────────┘ └───────────────┘  │
│      │                                                          │
│      │  ┌───────────────┐ ┌───────────────┐                    │
│      │  │ News Recap    │ │ Tutorial #2    │  ← đang GENERATING│
│      │  │ ──────────── │ │ ──────────── │                    │
│      │  │ 🔵 Generating│ │ 🔵 Generating │                    │
│      │  │               │ │               │                    │
│      │  │ ...           │ │ ...           │                    │
│      │  └───────────────┘ └───────────────┘                    │
└──────┴──────────────────────────────────────────────────────────┘
```

### 2.8 QUEUED Project — Script Viewer State

```
┌──────┬───────────────────────────────────────────────────────────┐
│      │  Projects > Tutorial #1                                   │
│      │  ─────────────────────────────────────────────────────── │
│      │                                                          │
│      │  ┌────────────────────────────────────────────────┐     │
│      │  │ 🕐 Queued · Waiting for generation slot        │     │
│      │  │ ⚡ 3/5 slots in use · Position in queue: #1     │     │
│      │  │                    [Cancel]                     │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                          │
│      │  ┌──────────────────────────────────────────────────┐   │
│      │  │                                                  │   │
│      │  │              🕐  Waiting for slot                │   │
│      │  │                                                  │   │
│      │  │    Your script will be generated automatically   │   │
│      │  │    when a slot becomes available.                │   │
│      │  │    You can navigate to other pages —             │   │
│      │  │    generation continues in background.           │   │
│      │  │                                                  │   │
│      │  │    ┌──────────────────────┐                      │   │
│      │  │    │  View Other Projects │                      │   │
│      │  │    └──────────────────────┘                      │   │
│      │  │                                                  │   │
│      │  └──────────────────────────────────────────────────┘   │
│      │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

### 2.9 Queue Full Notification

Khi user cố gắng tạo project mới và queue đã đầy (5/5):

```
┌──────────────────────────────────────────┐
│                                          │
│       ⚡ All generation slots are busy   │
│                                          │
│    5 projects are currently being        │
│    generated. Please wait for a slot     │
│    to free up before creating a new      │
│    project.                              │
│                                          │
│        ┌─────────────────────┐           │
│        │   Go to Dashboard   │           │
│        └─────────────────────┘           │
│                                          │
└──────────────────────────────────────────┘
```

---

## 3. Navigation Flow

```
/dashboard ────────────────────────────▶ Default landing
   │                                        │
   │ [Click card]                           │ [Click + New]
   │                                        │  (disabled nếu 5/5 queue full)
   ▼                                        ▼
/projects/[id]  ◀──────────────── /projects/new
   │                                    │
   │ [Generate]                         │ [Submit → auto enqueue]
   │  (QUEUED nếu queue full)           │
   ▼                                    │
/projects/[id]                          │
 (QUEUED → GENERATING → COMPLETED)      │
   │                                    │
   │ [Complete]                         ▼
   ▼                              /dashboard (có thể quay lại
/projects/[id]                    tạo thêm project khi slot trống)
 (COMPLETED state)
   │
   │ [Tabs: Timeline | Slides | JSON | Versions]
   │ [Edit slide → Save]
   │ [Save version]
   │ [Export JSON]
   │ [Regenerate]
```

---

## 4. Responsive Breakpoints

| Breakpoint | Sidebar | Project Grid | Script Viewer |
|------------|---------|-------------|---------------|
| Desktop (>1024px) | Fixed 240px | 3 columns | 2 tabs side by side |
| Tablet (768-1024px) | Collapsible | 2 columns | Tabs stacked |
| Mobile (<768px) | Sheet overlay | 1 column | Single card view |

---

## 5. Key Interaction Patterns

| Pattern | Mô tả |
|---------|-------|
| **SSE Progress** | Khi generate, step indicators sáng dần, progress bar fill, không block UI |
| **Concurrent Queue** | Tối đa 5 generation đồng thời. Vượt quá → QUEUED. Tự động dispatch khi slot trống. Sidebar hiển thị X/5 |
| **Polling Queue Status** | Client poll `/api/projects/queue/status` mỗi 3s để refresh queue bar + disabled state "New Project" button |
| **Optimistic Update** | Edit slide → update local state ngay → PATCH API background |
| **Toast Feedback** | Mọi action (save, delete, export, regenerate) đều có toast xác nhận |
| **Confirm Dialog** | Xoá project, regenerate (mất script cũ) → dialog confirm |
| **Keyboard Shortcuts** | Ctrl+S save slide, Esc close editor (P2) |
