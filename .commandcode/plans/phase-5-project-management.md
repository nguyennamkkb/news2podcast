# Phase 5 — Trang Quản Lý Project Riêng

## Mục tiêu
Tách trang `/projects` thành trang quản lý chuyên nghiệp riêng biệt, dạng table view có sort, filter, search, bulk actions.

## Hiện trạng
- Dashboard `/dashboard` đã có project list dạng grid cards
- `/projects` redirect về dashboard
- Sidebar chỉ có "Dashboard"

## Thiết kế

### `/projects` — Table view chuyên nghiệp

| Tính năng | Mô tả |
|-----------|-------|
| **Table** | Columns: Title, Status, Slides, Duration, Created, Actions |
| **Sort** | Sort theo title, createdAt, slideCount |
| **Filter** | Tabs: All, Draft, Queued, Generating, Completed, Failed |
| **Search** | Input search theo title |
| **Bulk select** | Checkbox chọn → xoá nhiều |
| **Quick actions** | Dropdown: View, Generate (nếu draft), Delete |
| **Pagination** | Phân trang nếu > 20 |
| **Empty state** | Minh họa khi chưa có project |

### Sidebar
Thêm "Projects" vào nav:
```
Dashboard
Projects
```

### Wireframe

```
┌──────┬────────────────────────────────────────────────────────────┐
│      │  Projects                                    [+ New Project]│
│      │  ──────────────────────────────────────────────────────── │
│      │  🔍 Search...                                              │
│ Side │  [All] [Draft] [Queued] [Generating] [Completed] [Failed] │
│ bar  │                                                           │
│      │  ☐  Title ▲        Status      Slides  Duration  Actions  │
│      │  ─────────────────────────────────────────────────────── │
│      │  ☐  AI Video Tips   ✅ Comp    12     5:00       ⋯       │
│      │  ☐  Product Intro   🔵 Gen     --     3:00       ⋯       │
│      │  ☐  Tutorial #1     🕐 Queued  --     2:00       ⋯       │
│      │  ☐  News Recap      ❌ Failed  --     5:00       ⋯       │
│      │                                                           │
│      │  [☐ Select All]  [Delete Selected]                       │
│      │  ← 1  2  3 →                                              │
└──────┴────────────────────────────────────────────────────────────┘
```

## Files cần tạo/sửa

| # | File | Action |
|---|------|--------|
| 1 | `src/app/(dashboard)/projects/page.tsx` | Tạo mới - trang projects |
| 2 | `src/components/projects/project-table.tsx` | Tạo mới - table component |
| 3 | `src/components/projects/project-table-row.tsx` | Tạo mới - row component |
| 4 | `src/components/layout/app-sidebar.tsx` | Sửa - thêm nav Projects |
| 5 | `src/lib/services/project-service.ts` | Sửa - thêm sort/order params |
| 6 | `src/app/api/projects/route.ts` | Sửa - parse sort/order query |

## API bổ sung

Thêm query params cho sort:

```
GET /api/projects?status=DRAFT&search=ai&sort=createdAt&order=desc&page=1&limit=20
```

## Thứ tự triển khai

1. Cập nhật `project-service.ts` + `route.ts` — thêm sort/order
2. Tạo `project-table.tsx` + `project-table-row.tsx`
3. Tạo `/projects/page.tsx`
4. Sửa sidebar thêm nav "Projects"
5. Kiểm tra

## Verification

- `/projects` hiển thị table đầy đủ
- Sort theo cột, filter tabs, search hoạt động
- Checkbox → xoá nhiều
- Empty state khi chưa có project
- Dashboard vẫn giữ grid view cũ
