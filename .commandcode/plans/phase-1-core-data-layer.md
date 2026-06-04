# Phase 1 — Core Data Layer

## Mục tiêu
Zod validators + API routes CRUD projects (không auth — API public).

## Trạng thái
- 🔜 Chưa bắt đầu

## Files cần tạo

### 2.1 `src/lib/validators/script.ts`
Zod schemas cho Script và Slide:
- `SlideType`: intro | content | transition | outro | cta
- `TransitionType`: fade | slide_left | slide_right | zoom_in | dissolve | none
- `VisualStyle`: cinematic | realistic | flat_illustration | minimalist | infographic
- `SlideSchema`: id, type, title, content, subtitle?, visualDescription, duration, transition, notes?, keywords?
- `ScriptSchema`: version, title, description?, language, totalDuration, visualStyle, targetPlatform, slides[], metadata?

### 2.2 `src/lib/validators/project.ts`
```typescript
export const createProjectSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  promptInput: z.string().min(1, "Vui lòng nhập yêu cầu kịch bản"),
  targetDuration: z.number().int().min(30).max(3600),
  style: z.string().optional(),
  language: z.string().default("vi"),
  targetPlatform: z.string().default("youtube"),
  visualStyle: z.string().default("cinematic"),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(1000).optional(),
  scriptData: z.any().optional(), // Script JSON
  status: z.string().optional(),
  slideCount: z.number().int().optional(),
});
```

### 2.3 `src/lib/utils/api-response.ts`
```typescript
import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}
```

### 2.4 `src/lib/services/project-service.ts`
Các function:
- `listProjects(params: { status?, search?, page?, limit? })` → projects + total
- `getProject(projectId: string)` → project + versions
- `createProject(data: CreateProjectInput)` → project
- `updateProject(projectId: string, data: UpdateProjectInput)` → project
- `deleteProject(projectId: string)` → void

### 2.5 `src/app/api/projects/route.ts`
- `GET`: list tất cả projects
- `POST`: create project với `createProjectSchema`

### 2.6 `src/app/api/projects/[projectId]/route.ts`
- `GET`: get project detail
- `PATCH`: update project (title, scriptData,...)
- `DELETE`: delete project

## Verification
- Gọi `POST /api/projects` → tạo project, status=DRAFT
- Gọi `GET /api/projects` → list projects
- Gọi `PATCH /api/projects/[id]` → update title
- Gọi `DELETE /api/projects/[id]` → xoá project

## Types (tạm tạo cùng phase)

### `src/types/project.ts`
```typescript
export interface ProjectListItem {
  id: string;
  title: string;
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED" | "ARCHIVED";
  targetDuration: number | null;
  slideCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectListItem {
  description: string | null;
  scriptData: Script | null;
  promptInput: string | null;
  style: string | null;
  language: string;
  targetPlatform: string;
  visualStyle: string;
  aiModel: string | null;
  aiTokensUsed: number | null;
}
```

### `src/types/script.ts`
```typescript
export type SlideType = "intro" | "content" | "transition" | "outro" | "cta";
export type TransitionType = "fade" | "slide_left" | "slide_right" | "zoom_in" | "dissolve" | "none";
export type VisualStyle = "cinematic" | "realistic" | "flat_illustration" | "minimalist" | "infographic";

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: string;
  subtitle?: string;
  visualDescription: string;
  duration: number;
  transition: TransitionType;
  notes?: string;
  keywords?: string[];
}

export interface Script {
  version: "1.0";
  title: string;
  description?: string;
  language: string;
  totalDuration: number;
  visualStyle: VisualStyle;
  targetPlatform: string;
  slides: Slide[];
  metadata?: {
    generatedBy: string;
    model: string;
    tokensUsed?: number;
    generatedAt: string;
  };
}
```
