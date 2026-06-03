# News2Video — UI/UX Design

## Nguyên tắc thiết kế

1. **Desktop-first, responsive-ready** — Tối ưu cho 1280-1920px. Dùng 2-3 cột. Không center-narrow mọi thứ.
2. **Information density** — 80%+ pixels mang thông tin. Giảm whitespace giữa các functional elements.
3. **Progressive disclosure** — Hiển thị tóm tắt mặc định, chi tiết khi cần. Collapsible sections, không phải separate pages.
4. **Visual hierarchy** — Một primary action mỗi screen, hai secondary, còn lại trong menus.
5. **Professional tool feel** — Dark sidebar, data tables, inline editing, keyboard shortcuts.
6. **Core pipeline focus** — Màn hình New Video là trung tâm. Input → Script → Approve là flow chính. Video production là step sau.

---

## Phân tích vấn đề hiện tại

| # | Vấn đề | Impact |
|---|--------|--------|
| 1 | **Wasted horizontal space** — Mọi page dùng `max-w-2xl` / `max-w-4xl`. Trên 1920px, 60-70% màn hình trống. | User scroll không cần thiết |
| 2 | **New Video single-column** — Content editor và config xếp chồng dọc. Nửa phải màn hình trống. | User phải scroll để thấy config |
| 3 | **Không thể review script** — Click "Generate Video" rồi chờ 2-5 phút, không biết script có đúng không. | Feedback loop quá dài — vấn đề lớn nhất |
| 4 | **Dashboard thiếu thông tin** — 4 stat cards (2 cái vô nghĩa: Cost $0, Voice Free), recent videos list không có thumbnail. | Dashboard cảm thấy trống |
| 5 | **Settings dàn trải** — 5 Cards cho 5 settings = quá nhiều scrolling. | 3 viewport heights để đổi 1 setting |
| 6 | **Video Detail nghèo nàn** — Chỉ 2 video players + 4 metadata. Không có slide breakdown. | Không review được nội dung |
| 7 | **History flat** — Table text-only, không thumbnail, không card view. | Tìm video cụ thể khó |
| 8 | **Không keyboard shortcuts** — Không Cmd+Enter submit, không duplicate settings. | Power users phải click nhiều |

---

## Màn Hình 1: Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard                                                      [+ New Video] │
├──────────┬───────────────────────────────────────────────────────────────────────┤
│          │                                                                       │
│ Dashboard│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────────────┐ │
│          │  │   42      │ │  1:23     │ │  4 today  │ │  ● Ollama  ● Connected │ │
│ New Video│  │ Videos    │ │ Avg Time  │ │ Processing│ │  qwen3:32b              │ │
│  History │  └──────────┘ └──────────┘ └──────────┘ └─────────────────────────┘ │
│  Settings│                                                                       │
│          │  Recent Videos                                                        │
│          │  ┌────────┬──────────────────────────────┬──────────┬──────┬──────┐ │
│          │  │ ▶ 9:16 │ Vietnam Tech Scene...          │ 2:30     │ Done │ ⋮   │ │
│          │  ├────────┼──────────────────────────────┼──────────┼──────┼──────┤ │
│          │  │ ▶ 9:16 │ AI Regulation Update            │ 1:45     │ Done │ ⋮   │ │
│  v0.1.0  │  ├────────┼──────────────────────────────┼──────────┼──────┼──────┤ │
│          │  │    ◉    │ Processing: Voiceover...        │ 45%      │ ⋯   │ ⋮   │ │
│          │  └────────┴──────────────────────────────┴──────────┴──────┴──────┘ │
│          │                                                       View All →     │
└──────────┴───────────────────────────────────────────────────────────────────────┘
```

### Chức năng

**Sidebar** — 4 mục: Dashboard, New Video, History, Settings. Footer: version + LLM status indicator.

**Stats row** — 4 cards trên 1 hàng:
1. **Total Videos** — Tổng số video đã tạo
2. **Avg Duration** — Thời lượng trung bình
3. **In Progress** — Số video đang xử lý (click để xem chi tiết)
4. **LLM Status** — Provider đang connected + model name. Click → jump to Settings

**Recent Videos table** — Với thumbnail column (56px), title, duration, status badge, actions menu (⋮).

---

## Màn Hình 2: New Video (Trung tâm — Core Pipeline)

Đây là màn hình quan trọng nhất. Bố cục 2 cột, nút bấm **"Generate Script"** (không phải "Generate Video").

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > New Video                                             [⌨ ⌘↵]  │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │  ┌──────────────────────────────┬────────────────────────────────────┐│
│          │  │                              │  Configuration                     ││
│          │  │  Content                     │  ┌────────────────────────────────┐  ││
│          │  │  ┌──────────────────────────┐│  │ Voice                     🔊  │  ││
│          │  │  │ [Paste] [Upload .md]    ││  │ ┌───────────────────────┐     │  ││
│          │  │  │ [Upload .txt]             ││  │ │ Nữ miền Bắc (Hoài My)│     │  ││
│          │  │  ├──────────────────────────┤│  │ └───────────────────────┘     │  ││
│          │  │  │                          ││  │                                │  ││
│          │  │  │  Paste your markdown or  ││  │ Format                         │  ││
│          │  │  │  plain text here...      ││  │ ┌────────┐ ┌────────┐        │  ││
│          │  │  │                          ││  │ │📱 9:16 │ │🖥️ 16:9│        │  ││
│          │  │  │                          ││  │ └────────┘ └────────┘        │  ││
│          │  │  │                          ││  │                                │  ││
│          │  │  │                          ││  │ Slides: 5   ──●─────────       │  ││
│          │  │  │                          ││  │                3        8      │  ││
│          │  │  │                          ││  │                                │  ││
│          │  │  │                          ││  │ Duration                       │  ││
│          │  │  │                          ││  │ [Auto] [30s] [60s] [90s]       │  ││
│          │  │  │                          ││  │                                │  ││
│          │  │  │                          ││  │ ☐ Background Music             │  ││
│          │  │  └──────────────────────────┘│  └────────────────────────────────┘  ││
│          │  │  342 words · Vietnamese      │                                    ││
│          │  └──────────────────────────────┴────────────────────────────────────┘│
│          │                                                                      │
│          │  ┌──────────────────────────────────────────────────────────────────┐│
│          │  │  LLM Provider                                                        ││
│          │  │  ● Ollama  ○ OpenAI-compatible        [⚡ Test Connection] ✓ OK    ││
│          │  └──────────────────────────────────────────────────────────────────┘│
│          │                                                                      │
│          │              [ ✨ Generate Script ]  · Ollama · qwen3:32b           │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Chức năng

**Cột trái (60%) — Content Editor:**
- Toggle tabs: Paste text / Upload .md / Upload .txt
- Textarea chiếm toàn bộ chiều cao còn lại (`calc(100vh - 300px)`)
- Status bar: word count · language detected
- Validate: < 10 words = disabled button + error

**Cột phải (40%) — Configuration:**
- Voice select + preview button (🔊)
- Format toggle (9:16 / 16:9)
- Slides slider (3-8)
- Duration toggle (Auto / 30s / 60s / 90s)
- Background music switch + track selector
- Tất cả trong 1 Card duy nhất, fields phân cách bằng Divider

**Thanh dưới (Full-width) — LLM Provider:**
- Radio: Ollama / OpenAI-compatible
- Conditional fields inline (URL, API Key, Model)
- Test Connection button với status indicator

**Nút "Generate Script"** — Không phải "Generate Video". Text mô tả đúng hành động: chỉ tạo kịch bản.

**Phím tắt:** Cmd+Enter / Ctrl+Enter = Submit

---

## Màn Hình 3: Script Review (MỚI — Core Pipeline)

Sau khi script được tạo, user chuyển sang màn hình review. Đây là **bước quan trọng nhất trong Core Pipeline** — user phải approve trước khi tiếp tục tạo video.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > Video Detail                                                    │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │  ┌─ Generated Script ───────────────────────────── [✏️ Edit Mode]──┐ │
│          │  │                                                                │ │
│          │  │  Slide 1 · Hook                    4.2s                    ▶   │ │
│          │  │  ┌─────────────────────────────────────────────────────────┐   │ │
│          │  │  │  Title:  Vietnam Tech Scene Heating Up                  │   │ │
│          │  │  │  Bullets:                                                 │   │ │
│          │  │  │    • Investment in Southeast Asia tech doubled YoY       │   │ │
│          │  │  │    • Global companies shifting focus to Vietnam          │   │ │
│          │  │  │  Voiceover:                                               │   │ │
│          │  │  │    "Việt Nam đang trở thành điểm nóng công nghệ..."      │   │ │
│          │  │  └─────────────────────────────────────────────────────────┘   │ │
│          │  │                                                                │ │
│          │  │  Slide 2 · Main Point              5.1s                    ▶   │ │
│          │  │  ▼ Title, bullets, voiceover...                              │ │
│          │  │                                                                │ │
│          │  │  Slide 3 · Analysis                3.8s                    ▶   │ │
│          │  │  ▼ Title, bullets, voiceover...                              │ │
│          │  │                                                                │ │
│          │  │  Slide 4 · CTA                     3.5s                    ▶   │ │
│          │  │  ▼ Title, bullets, voiceover...                              │ │
│          │  │                                                                │ │
│          │  └────────────────────────────────────────────────────────────────┘ │
│          │                                                                      │
│          │  ┌─ Summary ──────────────────────────────────────────────────────┐  │
│          │  │  4 slides · ~16s total · Vietnamese · 9:16 · Hoài My voice   │  │
│          │  └────────────────────────────────────────────────────────────────┘  │
│          │                                                                      │
│          │  [↺ Regenerate Script]              [✓ Approve & Create Video]      │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Chức năng

**Script Breakdown Panel:**
- Mỗi slide là 1 collapsible card: slide number · title · duration
- Click expand → hiện đầy đủ title, bullets, voiceover
- **Edit mode (nút ✏️):** Chuyển các field thành editable inputs
  - Title: text input
  - Bullets: list of text inputs (thêm/xóa bullets)
  - Voiceover: textarea
  - Duration: number input (tự động tính khi regenerate)

**Summary Bar:**
- Slide count · estimated duration · language · format · voice
- Cho user xác nhận cấu hình trước khi approve

**Hành động:**
- **"Regenerate Script"** — Gọi lại LLM với cùng content/config. Cho phép edit content rồi regenerate.
- **"Approve & Create Video"** — Chuyển sang production pipeline (TTS → Render → Done).

**Lưu ý về implementation:** Màn hình này cần Temporal workflow pause/resume support (Signal-based). Implementation plan:
- Phase 1: Tự động approve — generate script xong chuyển thẳng sang ProgressTracker
- Phase 2: Thêm Script Review — workflow pause sau generate_script, chờ user approve/reject qua API

---

## Màn Hình 4: Video Detail (Processing → Completed)

### Processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > Video Detail                                                    │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │            Generating Video                                          │
│          │                                                                      │
│          │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  67%                             │
│          │                                                                      │
│          │    ✓ Parsing content           0.8s                                   │
│          │    ✓ Generating script         3.2s                                   │
│          │    ✓ Creating voiceover        12.1s                                  │
│          │    ✓ Mixing audio              2.4s                                   │
│          │    ● Aligning words             ...                                   │
│          │    ○ Rendering video                                                    │
│          │    ○ Converting format                                                  │
│          │    ○ Uploading                                                            │
│          │    ○ Saving                                                               │
│          │                                                                      │
│          │                                              [✕ Cancel Job]           │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Completed

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > Video Detail                                                    │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │  ┌──────────────────┐  ┌────────────────────────────────────────────┐│
│          │  │                  │  │  📄 Slide Breakdown                        ││
│          │  │   ▶ 9:16        │  │  ─────────────────────────────────         ││
│          │  │   Video Player  │  │  1. Hook Title                    4.2s      ││
│          │  │                  │  │     • Bullet point 1                       ││
│          │  │                  │  │     • Bullet point 2                       ││
│          │  │                  │  │  2. Main Point                    3.8s        ││
│          │  │                  │  │     • Key fact                            ││
│          │  │                  │  │  3. Analysis                      5.1s       ││
│          │  │                  │  │     • Expert opinion                      ││
│          │  │                  │  │     • Data insight                        ││
│          │  └──────────────────┘  │  4. Conclusion                    3.5s      ││
│          │                        │     • Call to action                     ││
│          │  ┌──────────────────┐  └────────────────────────────────────────────┘│
│          │  │   ▶ 16:9        │                                                  │
│          │  │   Video Player  │  ┌──────┬───────┬──────────┬────────────────┐  │
│          │  └──────────────────┘  │Title │Slides │Duration  │Created          │  │
│          │                        │Hook  │4     │0:23     │Today 14:32      │  │
│          │                        └──────┴───────┴──────────┴────────────────┘  │
│          │                                                                      │
│          │  [⬇ Download 9:16]  [⬇ Download 16:9]  [↻ Regenerate]              │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Chức năng

**Processing:**
- Progress bar + percentage
- Step checklist: ✓ done, ● in progress, ○ pending
- Duration hiện khi step complete
- Cancel button

**Completed — Bố cục 2 cột:**
- **Cột trái**: 2 video player xếp chồng (9:16 nhỏ ở trên, 16:9 ở dưới)
- **Cột phải**: Slide Breakdown panel
  - Liệt kê each slide: title, bullets, duration
  - Click slide → seek video đến thời điểm tương ứng
- **Dưới cùng**: Metadata row + Download buttons

---

## Màn Hình 5: History

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > History                        [🔍 Search...        ] [Status ▾]│
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │  ┌───────┬────────────────────────┬──────────┬─────────┬──────┬───┐  │
│          │  │  ▶    │ Title                   │ Duration │ Status  │ Date │ ⋮│  │
│          │  ├───────┼────────────────────────┼──────────┼─────────┼──────┼───┤  │
│          │  │ thumb │ Vietnam Tech Scene...    │ 1:23     │ ✓ Done  │ 2h   │ ⋮│  │
│          │  │ thumb │ AI Regulation Update     │ 0:58     │ ✓ Done  │ 1d   │ ⋮│  │
│          │  │ thumb │ Climate Summit 2025       │ 2:10     │ ✓ Done  │ 3d   │ ⋮│  │
│          │  │  —    │ Processing: TTS...       │ —        │ ● Proc  │ 5m   │ ⋮│  │
│          │  │ thumb │ Education Reform         │ 1:45     │ ✓ Done  │ 1w   │ ⋮│  │
│          │  └───────┴────────────────────────┴──────────┼─────────┼──────┴───┘  │
│          │                                              ← 1  2  3 →           │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Chức năng

- Search + Filter ở header
- Data table: Thumbnail (56px), Title, Duration, Status badge, Date, Actions (⋮)
- Video đang processing có progress bar inline
- Pagination

---

## Màn Hình 6: Settings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ≡  Dashboard > Settings                                                         │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │  ┌─ Video Defaults ───────────────────────────────────────────────┐  │
│          │  │                                                                │  │
│          │  │  Voice          Format       Slides      Duration    BGM      │  │
│          │  │  ┌──────────┐  [9:16][16:9]  ●──5──●  [Auto][30][60]  ☐ Off │  │
│          │  │  │Hoài My ▾│  🔊 Preview                                         │  │
│          │  │  └──────────┘                                                    │  │
│          │  └────────────────────────────────────────────────────────────────┘  │
│          │                                                                      │
│          │  ┌─ LLM Provider ────────────────────────────────────────────────┐  │
│          │  │                                                                │  │
│          │  │  ● Ollama    ○ OpenAI-compatible     [⚡ Test Connection]     │  │
│          │  │                                                                │  │
│          │  │  API URL   ┌──────────────────────────────────────┐           │  │
│          │  │            │ https://ollama.example.com/api/gen.. │           │  │
│          │  │            └──────────────────────────────────────┘           │  │
│          │  │  Model     ┌──────────────────┐                              │  │
│          │  │            │ qwen3:32b        │                              │  │
│          │  │            └──────────────────┘                              │  │
│          │  │                                           ✓ Connected 1.2s   │  │
│          │  └────────────────────────────────────────────────────────────────┘  │
│          │                                                                      │
│          │                                              [↺ Reset to Defaults]  │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

### Chức năng

**2 Cards duy nhất:**

1. **Video Defaults** — Grid ngang 5 fields (Voice, Format, Slides, Duration, BGM)
2. **LLM Provider** — Radio + conditional fields + Test Connection

**Nút Reset** ở góc dưới phải.

---

## Component Architecture

```
app/
├── layout.tsx              — SidebarProvider + AppSidebar + SidebarInset
├── page.tsx               — Dashboard (stats + recent videos table)
├── new/page.tsx            — New Video (2-column: editor + config)
├── history/page.tsx        — History (searchable table with thumbnails)
├── settings/page.tsx       — Settings (2 cards, horizontal form grid)
├── video/[id]/page.tsx     — Video Detail (players + slide breakdown)
└── landing/page.tsx        — Landing (unchanged)

components/
├── app-sidebar.tsx         — Sidebar with nav + LLM status indicator
├── page-header.tsx         — Breadcrumb header with optional actions
├── ContentEditor.tsx       — Textarea with paste/upload toggle
├── ConfigPanel.tsx         — Form fields: voice, format, slides, duration, BGM
├── ScriptReview.tsx        — NEW: Collapsible slide list with edit mode
├── ProgressTracker.tsx     — Step list with progress
├── VideoPreview.tsx        — Video player (enhanced: seek support)
├── SlideBreakdown.tsx      — NEW: Expandable slide list with timing
├── VideoThumbnail.tsx      — NEW: 56px thumbnail for table rows
├── LLMStatusBadge.tsx      — NEW: Online/offline badge
└── HistoryTable.tsx         — Enhanced: thumbnail column, inline progress
```

---

## Thay đổi chính

| Màn hình | Thay đổi | Lý do |
|-----------|---------|-------|
| **New Video** | 2-column layout (60/40), nút "Generate Script" thay "Generate Video", ⌘↵ shortcut | Single-column waste 50%; nút phải đúng hành động |
| **Script Review (MỚI)** | Review/edit script trước tạo video. Collapsible slides, edit mode, approve/regenerate | Vấn đề lớn nhất — user không review được script trước khi chờ 2-5 phút |
| **Video Detail** | 2-column (players + slide breakdown), metadata row | Current: chỉ 2 bare players, không xem nội dung |
| **Dashboard** | 4 useful stats, recent videos table with thumbnails, LLM status | Current: 2 filler cards |
| **History** | Thumbnail column, inline progress, action menu ⋮ | Current: text-only table |
| **Settings** | 2 compact cards (grid 5-cols + LLM with test) | Current: 5 separate Cards |
| **All Pages** | Remove `max-w-2xl`/`max-w-4xl`, full sidebar width | Center-narrow wastes desktop |

---

## Implementation Phases

| Phase | Scope | Est. | Mô tả |
|-------|-------|------|-------|
| **P1** | New Video 2-column + Settings compact cards | 2 ngày | Thay đổi lớn nhất UX |
| **P2** | Script Review page + Edit mode | 3 ngày | Cần Temporal signal (pause/resume) |
| **P3** | Dashboard redesign + History enhanced table | 1 ngày | |
| **P4** | Video Detail slide breakdown + player improvements | 1 ngày | |
| **P5** | Keyboard shortcuts, LLM status badge, polish | 1 ngày | |

**Priority:** P1 → P2 → P3 → P4 → P5

P1 + P2 là **Core Pipeline** (Input → Script → Review → Approve). P3-P5 cải thiện UX tổng thể.

---

## Responsive Strategy

- **≥1280px**: Full layout (sidebar + 2-3 columns)
- **768-1279px**: Sidebar collapse to icons, single-column layout
- **<768px**: Bottom tab navigation, stacked forms, table → card list