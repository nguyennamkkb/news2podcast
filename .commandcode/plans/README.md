# Script Creator — Implementation Plans

Phân rã từ [PRD.md](../../PRD.md) thành các file plan theo phase để triển khai tuần tự.

| Phase | File | Mô tả | Trạng thái |
|-------|------|-------|------------|
| 0 | [phase-0-foundation.md](./phase-0-foundation.md) | Khởi tạo hạ tầng: package.json, Prisma, Tailwind, shadcn | 🔜 Pending |
| 1 | [phase-1-core-data-layer.md](./phase-1-core-data-layer.md) | Zod validators + API routes CRUD projects | 🔜 Pending |
| 2 | [phase-2-ai-integration.md](./phase-2-ai-integration.md) | OpenAI script generator + SSE streaming | 🔜 Pending |
| 3 | [phase-3-dashboard-ui.md](./phase-3-dashboard-ui.md) | Dashboard shell + Project list UI | 🔜 Pending |
| 4 | [phase-4-create-view-script.md](./phase-4-create-view-script.md) | Form tạo project + Script viewer/editor | 🔜 Pending |

## Tài liệu thiết kế

| File | Mô tả |
|------|-------|
| [ux-flow-and-wireframes.md](./ux-flow-and-wireframes.md) | UX flow, user journey, wireframes toàn bộ màn hình, responsive, interaction patterns |

## Thứ tự triển khai

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
```

Mỗi phase phụ thuộc vào phase trước đó.

## Công nghệ

- **Frontend:** Next.js 15 App Router, React 19, shadcn UI, tailwindcss
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM (jsonb cho script data)
- **AI:** OpenAI GPT-4o
- **State:** TanStack React Query
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react

> **Ghi chú:** Tạm thời không có authentication. API để public, project được lưu trực tiếp không cần user.
