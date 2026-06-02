# Phase 2 — Hoàn Thiện Frontend

> **Mục tiêu:** Hoàn thiện tất cả page frontend theo PRD screen designs + tích hợp API
> **Điều kiện tiên quyết:** Phase 1 hoàn thành (API hoạt động end-to-end)
> **Effort ước tính:** 12-16 giờ
> **Tiêu chí hoàn thành:** Tất cả 6 screen trong PRD hoạt động, UI khớp wireframe

---

## 1. Dashboard Hoàn Chỉnh

### 1.1 Tạo useDashboardStats hook

**File mới:** `frontend/src/hooks/useDashboardStats.ts`

```
Yêu cầu:
- Fetch stats từ API (cần thêm endpoint hoặc query từ list)
- Trả về: videosThisWeek, avgTime, totalCost
```

### 1.2 Sửa page.tsx — Dashboard động

**File cần sửa:** `frontend/src/app/page.tsx`

**Thay đổi:**
- Stats cards lấy từ hook (không hardcode 0/—)
- Recent Videos list từ API (GET /videos, limit 5)
- Mỗi video row: icon status + title + time ago + action buttons (download/xem)
- Empty state: "Chưa có video nào. Bắt đầu tạo video đầu tiên!"
- "New Video" button nổi bật ở trên cùng
- Thêm refresh button

### 1.3 Tạo component RecentVideoRow

**File mới:** `frontend/src/components/RecentVideoRow.tsx`

```
Props: video: VideoListResponse
Hiển thị:
- Status icon: ✅/🔄/❌
- Title (truncate nếu dài)
- Thời gian tạo (dạng "2 phút trước")
- Duration (nếu completed)
- Actions: Download (dropdown 9:16/16:9), Xem lại (link /video/:id), Retry (nếu failed)
```

---

## 2. Settings Page

### 2.1 Tạo app/settings/page.tsx

**File mới:** `frontend/src/app/settings/page.tsx`

```
Yêu cầu:
- Client component với local state (localStorage persistence)
- Sections:
  1. Default Voice: dropdown chọn giọng mặc định
  2. Default Format: toggle 9:16 / 16:9 / cả 2
  3. Default Slide Count: slider 3-8
  4. Default Duration: radio 30s / 60s / 90s / auto
  5. Ollama Cloud Config: input endpoint URL + model name
```

**Chi tiết:**
- Lưu settings vào `localStorage` key `news2video-settings`
- Load settings khi mount
- Khi save, hiển thị toast "Đã lưu cài đặt"
- Dùng shadcn/ui: Select, Switch, Slider, Input, Button
- Layout: sidebar-style hoặc single column form

### 2.2 Tạo hook useSettings

**File mới:** `frontend/src/hooks/useSettings.ts`

```typescript
interface UserSettings {
  defaultVoice: string;
  defaultFormat: '9x16' | '16x9';
  defaultOutputs: ('9x16' | '16x9')[];
  defaultSlideCount: number;
  defaultTargetDuration: number | 'auto';
  ollamaApiUrl: string;
  ollamaModel: string;
}
```

- `getSettings()` → đọc từ localStorage
- `saveSettings(settings)` → ghi vào localStorage
- Trả về `{ settings, saveSettings, isLoading }`

### 2.3 Tích hợp settings vào New page

**File cần sửa:** `frontend/src/app/new/page.tsx`

- Load settings khi mount, set làm default values
- Voice, format, slide count mặc định từ settings

---

## 3. New Video Page — Đầy Đủ

### 3.1 Thêm file upload

**File cần sửa:** `frontend/src/app/new/page.tsx`

**Thêm:**
- Tab selector: "📋 Paste text" | "📁 Upload .md" | "📄 Upload .txt"
- File input: accept `.md,.txt`, max 5MB
- Khi upload: đọc file bằng FileReader, set vào textarea
- Drag & drop zone (optional, nice-to-have)

### 3.2 Thêm duration selector

**File cần sửa:** `frontend/src/app/new/page.tsx`

**Thêm vào Config section:**
- Radio group: "Auto" | "30s" | "60s" | "90s"
- Dùng shadcn/ui ToggleGroup hoặc RadioGroup

### 3.3 Thêm background music selector

**File cần sửa:** `frontend/src/app/new/page.tsx`

**Thêm:**
- Dropdown: "None" | "News Theme 1" | "News Theme 2"
- Mỗi option có nút preview (nếu có file nhạc mẫu)
- Note: music implementation ở backend là future task, UI có trước

### 3.4 Tách component ContentEditor

**File mới:** `frontend/src/components/ContentEditor.tsx`

```
Props:
- value: string
- onChange: (value: string) => void
- wordCount: number
- language: string

Hiển thị:
- Textarea với monospace font
- Tab selector: Paste / Upload .md / Upload .txt
- File input hidden + trigger button
- Word count + language indicator ở dưới
```

### 3.5 Tách component ConfigPanel

**File mới:** `frontend/src/components/ConfigPanel.tsx`

```
Props:
- config: VideoConfig
- onChange: (config: Partial<VideoConfig>) => void

Hiển thị:
- Voice selector với VoicePreview button bên cạnh
- Format toggle (9:16 / 16:9)
- Duration selector
- Slide count slider
- Background music dropdown
```

### 3.6 Tạo hook useGenerateVideo

**File mới:** `frontend/src/hooks/useGenerateVideo.ts`

```typescript
export function useGenerateVideo() {
  return useMutation({
    mutationFn: ({ content, config }: CreateJobRequest) => api.createJob(content, config),
    onSuccess: (data) => {
      // Navigate to /video/:id
    },
  });
}
```

### 3.7 Thêm error state + validation

**File cần sửa:** `frontend/src/app/new/page.tsx`

- Content < 10 từ → disable Generate button + hiện message
- Content > 50000 từ → cảnh báo "Bài quá dài, video sẽ >5 phút"
- API error → toast/alert với message
- Loading state khi đang submit → button spinner

---

## 4. Video Detail Page — Đầy Đủ

### 4.1 Hoàn thiện video/[id]/page.tsx

**File cần sửa:** `frontend/src/app/video/[id]/page.tsx`

**3 trạng thái:**

#### Processing State
```
┌────────────────────────────────────────┐
│  ← Back          Generating...          │
│                                        │
│  📹 Đang tạo video của bạn              │
│  ████████████░░░░░░ 65%               │
│                                        │
│  ✅ Parsing content          (0.2s)   │
│  ✅ Generating script        (8.5s)   │
│  ✅ Creating voiceover       (12.3s)  │
│  🔄 Rendering video...       (45s)    │
│  ⏳ Converting format...              │
│                                        │
│  Thời gian còn lại: ~50 giây           │
│  [Hủy]                                │
└────────────────────────────────────────┘
```

#### Completed State
```
┌──────────────────────────────────────────────┐
│  ← Back                    ✅ Hoàn thành      │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │              │  │ Tiêu đề: ...          │  │
│  │ ▶ Preview    │  │ Slides: 5             │  │
│  │   9:16       │  │ Thời lượng: 1:24      │  │
│  │              │  │ Dung lượng: 12.4 MB    │  │
│  └──────────────┘  │ Tạo lúc: 2 phút trước │  │
│                    │                       │  │
│  ┌──────────────┐  │ [⬇ Tải 9:16 (MP4)]   │  │
│  │ ▶ Preview    │  │ [⬇ Tải 16:9 (MP4)]   │  │
│  │   16:9       │  │                       │  │
│  │              │  │ [🔄 Tạo lại]           │  │
│  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────┘
```

#### Failed State
```
┌────────────────────────────────────────┐
│  ← Back              ❌ Thất bại        │
│                                        │
│  Lỗi: Ollama Cloud timeout sau 30s    │
│                                        │
│  [🔄 Thử lại]  [📋 Sao chép lỗi]       │
└────────────────────────────────────────┘
```

### 4.2 Tạo component VideoPlayer

**File mới:** `frontend/src/components/VideoPlayer.tsx`

```
Props:
- src: string
- poster?: string (thumbnail)
- aspectRatio: '9:16' | '16:9'

Features:
- HTML5 video với custom controls
- Play/pause, volume, progress bar, fullscreen
- Auto-play khi video ready (có mute default)
- Loading spinner khi buffer
```

---

## 5. History Page — Đầy Đủ

### 5.1 Hoàn thiện history/page.tsx

**File mới:** `frontend/src/app/history/page.tsx`

**Layout:**
```
┌──────────────────────────────────────────────┐
│  ← Dashboard          Lịch sử          ⚙️     │
├──────────────────────────────────────────────┤
│                                              │
│  Bộ lọc: [Tất cả ▼] [Tất cả ngôn ngữ ▼]      │
│          [7 ngày qua ▼]                       │
│  Tìm kiếm: [🔍 Tìm theo tiêu đề...]           │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Status│ Tiêu đề        │ Ngày   │ Time │  │
│  │───────│────────────────│────────│──────│  │
│  │ ✅    │ Tin tức hôm nay │ 2p trc │ 1:24 │  │
│  │ 🔄   │ Báo cáo TT     │ 1p trc │ —    │  │
│  │ ❌   │ Sự kiện tuần   │ 2h trc │ —    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ← 1 2 3 ... 12 →                            │
└──────────────────────────────────────────────┘
```

**Chi tiết:**
- Table component với sortable columns
- Status filter dropdown
- Language filter dropdown
- Date range filter (last 7 days / 30 days / all)
- Search input với debounce
- Pagination với page numbers
- Row click → navigate /video/:id
- Download button mỗi row (dropdown chọn format)
- Re-generate button cho các video failed

### 5.2 Tạo component HistoryTable

**File mới:** `frontend/src/components/HistoryTable.tsx`

```
Props:
- videos: VideoListResponse[]
- isLoading: boolean
- pagination: PaginationInfo
- onPageChange: (page: number) => void
- onFilterChange: (filters: FilterState) => void

Features:
- Table với sticky header
- Loading skeleton khi đang fetch
- Empty state: "Chưa có video nào"
- Responsive: trên mobile chuyển sang card layout
```

---

## 6. Navigation & Layout

### 6.1 Tạo shared Navbar component

**File mới:** `frontend/src/components/Navbar.tsx`

```
Yêu cầu:
- Logo "News2Video" → link /
- Nav links: Dashboard | New Video | History | Settings
- Active state highlight
- Responsive: hamburger menu trên mobile
```

### 6.2 Tích hợp Navbar vào layout

**File cần sửa:** `frontend/src/app/layout.tsx`

- Import Navbar
- Wrap children với Navbar + main content
- Giữ nguyên Providers + ErrorBoundary

---

## 7. Design Polish

### 7.1 Thêm transitions + animations

- Page transition: fade in khi navigate
- Button hover effects
- Card hover: subtle shadow + scale
- Progress bar animate width
- Skeleton loading cho cards và table

### 7.2 Responsive design

**Breakpoints:**
- Mobile (< 768px): single column, full width cards
- Tablet (768-1024px): 2 column grid
- Desktop (> 1024px): full layout như wireframe

### 7.3 Empty states

| Page | Empty state message |
|------|-------------------|
| Dashboard | "Chưa có video nào. Bắt đầu tạo video đầu tiên!" + CTA button |
| History | "Chưa có video nào trong lịch sử" + link đến /new |
| Settings | Form trống với defaults |

---

## Verification Checklist (Phase 2 Done)

- [ ] Dashboard hiển thị stats thật + recent videos từ API
- [ ] New page có đủ: content editor (paste + upload) + config panel (voice, format, duration, slides, bg music)
- [ ] Settings page lưu/load từ localStorage, áp dụng defaults vào New page
- [ ] Video detail page hiển thị 3 trạng thái: processing / completed / failed
- [ ] Video player hoạt động với preview + download
- [ ] History page có filter, search, pagination
- [ ] Navbar nhất quán trên tất cả page
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Landing page link đúng → /new
