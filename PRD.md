# Script Creator - PRD & Implementation Plan

## Tổng quan

Hệ thống web tạo và quản lý kịch bản video. User nhập yêu cầu → AI (GPT-4o) tạo kịch bản dạng JSON chia thành slide → Quản lý trên Dashboard shadcn UI.

**Stack:** Next.js 15 App Router + PostgreSQL + Prisma + OpenAI GPT-4o + shadcn UI

> **Ghi chú:** Tạm thời không có authentication. API để public. Hỗ trợ đa nhiệm tạo tối đa 5 kịch bản cùng lúc.

---

## 1. Product Requirements

### 1.1 User Stories

| # | Story | Priority |
|---|-------|----------|
| US-01 | Là creator, tôi muốn nhập yêu cầu (chủ đề, độ dài, phong cách) để AI tạo kịch bản video | P0 |
| US-02 | Là creator, tôi muốn xem kịch bản dưới dạng timeline slide-by-slide | P0 |
| US-03 | Là creator, tôi muốn chỉnh sửa từng slide (nội dung, subtitle, duration) sau khi AI tạo | P1 |
| US-04 | Là creator, tôi muốn quản lý nhiều project kịch bản trên dashboard | P0 |
| US-05 | Là creator, tôi muốn export kịch bản ra JSON để dùng cho pipeline làm video | P1 |
| US-06 | Là creator, tôi muốn xem lịch sử version để rollback khi cần | P2 |
| US-07 | Là creator, tôi muốn tạo tối đa 5 kịch bản đồng thời để tiết kiệm thời gian chờ | P0 |
| US-08 | Là creator, tôi muốn biết có bao nhiêu kịch bản đang được AI tạo cùng lúc | P1 |

### 1.2 Core Flow

```
Nhập yêu cầu → AI nghiên cứu → AI tạo JSON kịch bản → Validate → Lưu DB → Hiển thị Dashboard
```

### 1.3 Script JSON Schema (Hợp đồng dữ liệu cốt lõi)

```typescript
interface Script {
  version: "1.0";
  title: string;
  description?: string;
  language: "vi" | "en";
  totalDuration: number;          // giây
  visualStyle: "cinematic" | "realistic" | "flat_illustration" | "minimalist" | "infographic";
  targetPlatform: "youtube" | "tiktok" | "facebook" | "generic";
  slides: Slide[];
  metadata?: {
    generatedBy: string;
    model: string;
    tokensUsed?: number;
    generatedAt: string;          // ISO datetime
  };
}

interface Slide {
  id: string;                     // "slide-1", "slide-2", ...
  type: "intro" | "content" | "transition" | "outro" | "cta";
  title: string;                  // Tiêu đề slide
  content: string;                // Nội dung chính (text hiển thị trên slide)
  subtitle?: string;              // Subtitle (cho video caption)
  visualDescription: string;      // Mô tả visual để dùng cho AI image generation
  duration: number;               // giây (5-120)
  transition: "fade" | "slide_left" | "slide_right" | "zoom_in" | "dissolve" | "none";
  notes?: string;                 // Ghi chú đạo diễn
  keywords?: string[];            // Tag để search
}
```

---

## 2. Data Model (Prisma)

```prisma
enum ProjectStatus {
  DRAFT
  QUEUED
  GENERATING
  COMPLETED
  FAILED
  ARCHIVED
}

model Project {
  id             String        @id @default(cuid())
  title          String
  description    String?       @db.Text
  status         ProjectStatus @default(DRAFT)
  scriptData     Json?         @db.JsonB
  targetDuration Int?
  slideCount     Int?
  promptInput    String?       @db.Text
  style          String?
  language       String        @default("vi")
  targetPlatform String        @default("youtube")
  visualStyle    String        @default("cinematic")
  aiModel        String?
  aiTokensUsed   Int?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  versions       ScriptVersion[]

  @@index([status])
  @@index([createdAt])
}

model ScriptVersion {
  id         String   @id @default(cuid())
  projectId  String
  version    Int
  scriptData Json     @db.JsonB
  changelog  String?  @db.Text
  createdAt  DateTime @default(now())
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, version])
}
```

---

## 3. Kiến trúc thư mục

```
script-creator/
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (providers)
│   │   ├── page.tsx                      # Landing → /dashboard
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Sidebar + Header shell
│   │   │   ├── dashboard/page.tsx        # Project list + stats
│   │   │   ├── projects/
│   │   │   │   ├── new/page.tsx          # Create project form
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx          # Script viewer/editor
│   │   │   │       └── versions/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── projects/
│   │       │   ├── route.ts              # GET list, POST create
│   │       │   └── [projectId]/
│   │       │       ├── route.ts          # GET, PATCH, DELETE
│   │       │       ├── generate/route.ts # POST trigger AI
│   │       │       └── versions/route.ts
│   │       └── ai/research/route.ts
│   ├── components/
│   │   ├── ui/                           # shadcn primitives
│   │   ├── layout/                       # Sidebar, Header, AuthGuard
│   │   ├── projects/                     # ProjectCard, ProjectList, CreateForm
│   │   ├── script/                       # ScriptViewer, SlideCard, SlideEditor, Timeline
│   │   └── shared/                       # EmptyState, ErrorState, Loading
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── validators/
│   │   │   ├── project.ts               # Zod schemas
│   │   │   └── script.ts                # Script + Slide Zod schemas
│   │   ├── ai/
│   │   │   ├── openai-client.ts
│   │   │   ├── prompts/
│   │   │   │   ├── research-prompt.ts
│   │   │   │   └── script-gen-prompt.ts
│   │   │   ├── script-generator.ts       # Orchestrator per project
│   │   │   ├── script-validator.ts       # Validate + retry
│   │   │   └── generation-queue.ts       # Queue manager: max 5 concurrent
│   │   ├── services/
│   │   │   ├── project-service.ts
│   │   │   └── script-service.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── api-response.ts
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-script.ts
│   │   └── use-script-generation.ts
│   ├── types/
│   │   ├── project.ts
│   │   ├── script.ts
│   │   └── api.ts
│   └── styles/globals.css
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── tsconfig.json
└── package.json
```

---

## 4. API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create new project |
| `GET` | `/api/projects/[id]` | Get project + script |
| `PATCH` | `/api/projects/[id]` | Update project/script |
| `DELETE` | `/api/projects/[id]` | Delete project |
| `POST` | `/api/projects/[id]/generate` | Trigger AI generation (SSE streaming) |
| `GET` | `/api/projects/[id]/versions` | List versions |
| `POST` | `/api/projects/[id]/versions` | Save new version |
| `GET` | `/api/projects/queue/status` | Check số lượng generation đang chạy (max 5) |

---

## 5. AI Pipeline (Core)

```
User Input → Create Project (DRAFT) → Enqueue vào Generation Queue
→ Queue Manager kiểm tra: nếu < 5 concurrent dispatch
→ Research Prompt (GPT-4o) → Context → Script Gen Prompt (GPT-4o)
→ JSON Output → Zod Validation → Retry if invalid (max 3) → Save to DB
→ Dequeue → tiếp tục project kế tiếp trong hàng đợi
```

**Concurrency Model:**
- Tối đa **5 generation chạy đồng thời**
- Các request vượt quá 5 sẽ được **xếp hàng đợi (pending)**
- Khi 1 generation hoàn thành → tự động dispatch generation kế tiếp trong queue
- Mỗi project có trạng thái `QUEUED` khi đang chờ

**Prompt Strategy:**
1. **Research prompt:** "Bạn là researcher. Nghiên cứu topic X và trả về key points, data, insights..."
2. **Script gen prompt:** "Dựa trên research sau, tạo kịch bản video JSON theo schema... Mỗi slide phải có visual description chi tiết để dùng cho AI image generation."

**Response Mode:** SSE streaming per project để hiển thị tiến trình real-time: `queued → researching → generating → validating → completed`

---

## 6. Pages

| Page | Route | Components |
|------|-------|------------|
| **Dashboard** | `/dashboard` | StatsRow (total, month, avg) + ProjectList (search, filter, grid) |
| **New Project** | `/projects/new` | ProjectCreateForm (title, prompt, duration, style, platform) |
| **Script Viewer** | `/projects/[id]` | Tabs: Timeline (SlideCard list) + Slides (SlideEditor list) + JSON view + Versions |

---

## 7. Component Tree

```
<RootLayout>
  <Providers>                          // Theme, Toast
    <DashboardShell>
      <AppSidebar>                     // Logo, Nav items
      <main>
        <AppHeader>                    // Breadcrumb, actions
        {children}
      </main>
    </DashboardShell>
  </Providers>
</RootLayout>
```

---

## 8. Implementation Order

### Phase 0 — Foundation
| Step | File | What |
|------|------|------|
| 0.1 | `package.json` | Init Next.js, deps: prisma, openai, zod, shadcn, tailwind |
| 0.2 | `prisma/schema.prisma` | Data model (Project + ScriptVersion) + `npx prisma db push` |
| 0.3 | `.env` + `.env.example` | DATABASE_URL, OPENAI_API_KEY |
| 0.4 | `tailwind.config.ts`, `components.json` | shadcn init |
| 0.5 | `src/styles/globals.css` | CSS variables |
| 0.6 | `src/lib/prisma.ts` | Prisma client singleton |
| 0.7 | `src/lib/utils/cn.ts` | Tailwind merge helper |

### Phase 1 — Core Data Layer
| Step | File | What |
|------|------|------|
| 1.1 | `src/lib/validators/script.ts` | Zod schemas: ScriptSchema, SlideSchema, enums |
| 1.2 | `src/lib/validators/project.ts` | Zod: createProjectSchema, updateProjectSchema |
| 1.3 | `src/lib/utils/api-response.ts` | successResponse(), errorResponse() helpers |
| 1.4 | `src/lib/services/project-service.ts` | listProjects, getProject, createProject, updateProject, deleteProject |
| 1.5 | `src/app/api/projects/route.ts` | GET (list) + POST (create) |
| 1.6 | `src/app/api/projects/[projectId]/route.ts` | GET + PATCH + DELETE |

### Phase 2 — AI Integration
| Step | File | What |
|------|------|------|
| 2.1 | `src/lib/ai/openai-client.ts` | OpenAI SDK wrapper với error handling |
| 2.2 | `src/lib/ai/prompts/research-prompt.ts` | System prompt cho research phase |
| 2.3 | `src/lib/ai/prompts/script-gen-prompt.ts` | System prompt tạo JSON script |
| 2.4 | `src/lib/ai/script-generator.ts` | Orchestrator: research → generate → validate → retry |
| 2.5 | `src/lib/ai/script-validator.ts` | Zod validate + retry logic (max 3 attempts) |
| 2.6 | `src/lib/ai/generation-queue.ts` | Queue manager: max 5 concurrent, FIFO queue |
| 2.7 | `src/app/api/projects/[projectId]/generate/route.ts` | SSE streaming endpoint + enqueue |
| 2.8 | `src/app/api/projects/queue/status/route.ts` | Queue status endpoint |
| 2.9 | `src/lib/services/script-service.ts` | saveScript, createVersion, getVersions |
| 2.10 | `src/app/api/projects/[projectId]/versions/route.ts` | Versions CRUD |

### Phase 3 — Dashboard UI
| Step | File | What |
|------|------|------|
| 3.1 | shadcn components | Install button, card, input, textarea, select, tabs, badge, dialog, dropdown, skeleton, toast, progress, separator, tooltip |
| 3.2 | `src/components/layout/app-sidebar.tsx` | Sidebar navigation + queue status badge |
| 3.3 | `src/components/layout/app-header.tsx` | Breadcrumb + actions + queue indicator |
| 3.4 | `src/app/(dashboard)/layout.tsx` | DashboardShell layout |
| 3.5 | `src/app/(dashboard)/dashboard/page.tsx` | Stats + QueueStatus + ProjectList |
| 3.6 | `src/components/projects/project-card.tsx` | Card hiển thị project (cả QUEUED state) |
| 3.7 | `src/components/projects/project-list.tsx` | Grid + search + filter |
| 3.8 | `src/components/projects/project-status-badge.tsx` | Status badge (+ QUEUED = yellow) |
| 3.9 | `src/components/projects/generation-queue-status.tsx` | Queue bar: "3/5 slots used" |
| 3.10 | `src/components/shared/empty-state.tsx` | Empty state illustration |

### Phase 4 — Create & View Script
| Step | File | What |
|------|------|------|
| 4.1 | `src/app/(dashboard)/projects/new/page.tsx` | Create project form page |
| 4.2 | `src/components/projects/project-create-form.tsx` | Form: title, prompt, duration, style, platform |
| 4.3 | `src/hooks/use-projects.ts` | React Query hooks for projects |
| 4.4 | `src/hooks/use-script-generation.ts` | Hook xử lý SSE stream |
| 4.5 | `src/app/(dashboard)/projects/[projectId]/page.tsx` | Script viewer page với Tabs |
| 4.6 | `src/components/script/script-generate-panel.tsx` | Generate button + progress + status |
| 4.7 | `src/components/script/slide-card.tsx` | 1 slide display card |
| 4.8 | `src/components/script/script-timeline.tsx` | Timeline view (list SlideCard) |
| 4.9 | `src/components/script/slide-editor.tsx` | Inline edit slide fields |
| 4.10 | `src/components/script/slide-list.tsx` | List view với SlideEditor |
| 4.11 | `src/components/script/script-export.tsx` | Export JSON button |

---

## 9. Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@prisma/client": "^6",
    "openai": "^4",
    "zod": "^3",
    "@tanstack/react-query": "^5",
    "lucide-react": "^0.400",
    "tailwind-merge": "^2",
    "clsx": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "prisma": "^6",
    "tailwindcss": "^3",
    "@types/node": "^22",
    "@types/react": "^19",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

---

## 10. Verification

Sau khi triển khai, kiểm tra:

1. **Create project:** POST /api/projects → status=DRAFT → hiển thị trong list
2. **AI Generation:** Trigger generate → SSE stream hiển thị progress → script JSON được lưu → status=COMPLETED
3. **Script Viewer:** Mở project → thấy timeline các slide → edit được từng slide
4. **Validation:** Input sai schema → Zod báo lỗi → retry → thành công
5. **Dashboard:** List project → search/filter hoạt động → empty state khi không có project
6. **Versioning:** Save version → hiển thị trong version history
