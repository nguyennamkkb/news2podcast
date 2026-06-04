# Phase 3 — Dashboard UI

## Mục tiêu
Dashboard shell (sidebar + header) + Project list page + **Queue status indicator** với shadcn UI. Không cần auth.

## Trạng thái
- 🔜 Chưa bắt đầu

## Files cần tạo

### 3.1 shadcn UI Components
Cần cài qua `npx shadcn@latest add` hoặc viết thủ công:
- button, card, input, textarea, select, tabs, badge, dialog, dropdown-menu, skeleton, toast, progress, separator, tooltip, label, sheet

### 3.2 `src/components/layout/app-sidebar.tsx`
Sidebar trái cố định:
- Logo + tên app "Script Creator"
- Nav items: Dashboard, Projects (dùng `lucide-react` icons)
- **Queue status badge**: hiển thị "2/5" slots đang dùng (polling `/api/projects/queue/status` mỗi 3s)
- Dùng `Sheet` cho responsive mobile

queue badge:
```
┌─────────────┐
│ ⚡ 3/5 busy  │
└─────────────┘
```
Nếu 5/5 → badge màu đỏ cảnh báo "Queue full"
Nếu < 5 → badge màu xanh "Slots available"

### 3.3 `src/components/layout/app-header.tsx`
Top bar:
- Breadcrumb navigation
- Nút "New Project" (primary) — **disabled khi 5/5 slots đang bận**
- Mobile menu toggle

### 3.4 `src/app/(dashboard)/layout.tsx`
Dashboard shell: `<AppSidebar /> + <AppHeader /> + {children}`
Wrap với `QueryClientProvider` từ TanStack React Query.

### 3.5 `src/app/(dashboard)/dashboard/page.tsx`
Dashboard chính:
- **QueueStatusBar**: component hiển thị trạng thái queue
- Stats row: Tổng projects, projects this month, avg duration
- ProjectList component

### 3.6 `src/components/projects/project-card.tsx`
Card hiển thị 1 project:
- Title, description preview
- Status badge (thêm QUEUED state)
- Duration, slide count
- Thời gian tạo
- Action menu (edit, delete)
- Nếu status GENERATING: hiển thị progress indicator nhỏ

### 3.7 `src/components/projects/project-list.tsx`
Grid layout cards:
- Search input (search theo title)
- Filter tabs: All, Draft, Queued, Generating, Completed, Failed
- Empty state khi không có project
- Loading skeleton

### 3.8 `src/components/projects/project-status-badge.tsx`
Badge hiển thị status với màu:
- DRAFT: gray
- QUEUED: yellow/orange (có icon đồng hồ)
- GENERATING: blue + animate pulse
- COMPLETED: green
- FAILED: red
- ARCHIVED: muted

### 3.9 `src/components/projects/generation-queue-status.tsx` ⭐ MỚI

Queue status bar trên đầu dashboard:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚡ Generation Slots                                         │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                              │
│  │ ● │ │ ● │ │ ● │ │ ○ │ │ ○ │   3/5 slots in use           │
│  └───┘ └───┘ └───┘ └───┘ └───┘                              │
│  ──────────────────────────────────────────────────────     │
│  Queue: 2 projects waiting                                   │
└──────────────────────────────────────────────────────────────┘
```

3 trạng thái:
- **Slots available (< 5)**: màu xanh, các slot trống màu gray
- **Full (5/5)**: màu đỏ, cảnh báo "All slots busy. New requests will be queued."
- **Empty**: không hiển thị bar (hoặc "No active generation")

**Implementation:**
```typescript
export function GenerationQueueStatus() {
  const { data } = useQuery({
    queryKey: ["queue-status"],
    queryFn: () => fetch("/api/projects/queue/status").then(r => r.json()),
    refetchInterval: 3000, // poll mỗi 3s
  });

  if (!data || data.activeCount === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2">
        <ZapIcon />
        <span>Generation Slots</span>
      </div>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: data.maxConcurrent }).map((_, i) => (
          <Slot key={i} active={i < data.activeCount} />
        ))}
        <span>{data.activeCount}/{data.maxConcurrent} slots in use</span>
      </div>
      {data.queueLength > 0 && (
        <p>Queue: {data.queueLength} projects waiting</p>
      )}
    </Card>
  );
}
```

### 3.10 `src/components/shared/empty-state.tsx`
Empty state illustration:
- Icon (lucide-react)
- Title, description
- CTA button "Create your first project"

## Verification
- Dashboard có sidebar + header
- Queue status bar hiển thị slots khi có generation đang chạy
- Nút "New Project" disabled khi queue full (5/5)
- Project list hiển thị cards với QUEUED/GENERATING states
- Search/filter hoạt động với filter QUEUED
- Polling queue status mỗi 3s, tự động ẩn khi không active
