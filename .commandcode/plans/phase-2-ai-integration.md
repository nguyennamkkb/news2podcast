# Phase 2 — AI Integration

## Mục tiêu
OpenAI script generation pipeline với **queue manager**: tối đa 5 generation chạy đồng thời, vượt quá thì xếp hàng QUEUED.

## Trạng thái
- 🔜 Chưa bắt đầu

## Generation Queue Architecture

```
POST /api/projects/[id]/generate
         │
         ▼
  ┌─────────────────┐
  │ GenerationQueue  │  ← Singleton, in-memory
  │                  │
  │  maxConcurrent: 5│
  │  active: Set     │  ← project IDs đang chạy
  │  queue: []       │  ← project IDs đang chờ (FIFO)
  │  listeners: Map  │  ← project ID → event emitter
  └─────────────────┘
         │
         │  active.size < 5 ?
         │
    ┌────▼────┐          ┌──────────┐
    │ Dispatch│          │ Enqueue  │
    │ ngay    │          │ QUEUED   │
    └────┬────┘          └──────────┘
         │
         ▼
  ScriptGenerator.generate()
         │
         ▼ SSE events → listeners
         │
    ┌────▼────┐
    │ On done │ → remove from active
    │ or fail │ → dispatchNext() từ queue
    └─────────┘
```

## Files cần tạo

### 2.1 `src/lib/ai/openai-client.ts`

```typescript
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; temperature?: number; responseFormat?: "json_object" | "text" }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || "gpt-4o",
    temperature: options?.temperature || 0.7,
    response_format: options?.responseFormat === "json_object"
      ? { type: "json_object" }
      : undefined,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return response;
}
```

### 2.2 `src/lib/ai/prompts/research-prompt.ts`

```typescript
export function buildResearchPrompt(topic: string, language: string): string {
  return `Bạn là researcher chuyên nghiên cứu chủ đề để viết kịch bản video.
Nghiên cứu chủ đề sau và trả về key points, số liệu, insights:
${topic}

Trả lời bằng ${language === "vi" ? "tiếng Việt" : "English"}.`;
}
```

### 2.3 `src/lib/ai/prompts/script-gen-prompt.ts`

```typescript
export function buildScriptGenPrompt(
  research: string,
  options: { language?: string; targetDuration?: number; style?: string; targetPlatform?: string; visualStyle?: string }
): string {
  return `Dựa trên research sau, tạo kịch bản video JSON theo schema:
${research}

Yêu cầu:
- Tổng duration: khoảng ${options.targetDuration || 300} giây
- Ngôn ngữ: ${options.language === "vi" ? "tiếng Việt" : "English"}
- Phong cách: ${options.style || "professional"}
- Platform: ${options.targetPlatform || "youtube"}
- Visual style: ${options.visualStyle || "cinematic"}

Output JSON object với cấu trúc Script schema. Mỗi slide phải có visualDescription chi tiết để dùng cho AI image generation.`;
}
```

### 2.4 `src/lib/ai/script-validator.ts`

```typescript
import { ScriptSchema } from "@/lib/validators/script";

export class ScriptValidationError extends Error {
  constructor(
    message: string,
    public details: unknown
  ) {
    super(message);
    this.name = "ScriptValidationError";
  }
}

export function validateScript(rawOutput: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    throw new ScriptValidationError("Invalid JSON", null);
  }

  const result = ScriptSchema.safeParse(parsed);
  if (!result.success) {
    throw new ScriptValidationError("Schema validation failed", result.error.issues);
  }

  return result.data;
}

// Retry wrapper: gọi generateFn, validate, nếu fail → retry max 3 lần
export async function generateWithRetry(
  generateFn: () => Promise<string>,
  maxRetries = 3
): ReturnType<typeof validateScript> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const rawOutput = await generateFn();
      return validateScript(rawOutput);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxRetries) throw lastError;
      // tiếp tục retry
    }
  }

  throw lastError ?? new Error("Unknown error");
}
```

### 2.5 `src/lib/ai/script-generator.ts`

```typescript
import { chatCompletion } from "./openai-client";
import { buildResearchPrompt } from "./prompts/research-prompt";
import { buildScriptGenPrompt } from "./prompts/script-gen-prompt";
import { generateWithRetry } from "./script-validator";
import { prisma } from "@/lib/prisma";

export type GenerationEvent =
  | { type: "queued" }
  | { type: "researching" }
  | { type: "generating" }
  | { type: "validating"; attempt: number }
  | { type: "completed"; script: Script }
  | { type: "error"; message: string };

export async function generateScript(
  projectId: string,
  promptInput: string,
  options: { style?: string; language?: string; targetDuration?: number; targetPlatform?: string; visualStyle?: string },
  onProgress: (event: GenerationEvent) => void
) {
  try {
    // Update status → GENERATING
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "GENERATING" },
    });

    // Step 1: Research
    onProgress({ type: "researching" });
    const researchResponse = await chatCompletion(
      "Bạn là researcher chuyên nghiên cứu chủ đề.",
      buildResearchPrompt(promptInput, options.language || "vi"),
      { temperature: 0.5 }
    );
    const researchContent = researchResponse.choices[0]?.message?.content || "";

    // Step 2: Generate script with retry
    onProgress({ type: "generating" });
    const script = await generateWithRetry(
      () =>
        chatCompletion(
          buildScriptGenPrompt(researchContent, options),
          "Hãy tạo kịch bản video JSON.",
          { responseFormat: "json_object", temperature: 0.7 }
        ).then((res) => res.choices[0]?.message?.content || ""),
      3
    );

    // Step 3: Save
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "COMPLETED",
        scriptData: script as any,
        slideCount: script.slides.length,
        aiModel: "gpt-4o",
        aiTokensUsed: researchResponse.usage?.totalTokens,
      },
    });

    // Save version 1
    await prisma.scriptVersion.create({
      data: {
        projectId,
        version: 1,
        scriptData: script as any,
        changelog: "AI initial generation",
      },
    });

    onProgress({ type: "completed", script });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    });
    onProgress({ type: "error", message });
    throw err;
  }
}
```

### 2.6 `src/lib/ai/generation-queue.ts` ⭐ CORE

```typescript
import { generateScript, type GenerationEvent } from "./script-generator";

const MAX_CONCURRENT = 5;

type QueueItem = {
  projectId: string;
  promptInput: string;
  options: Record<string, unknown>;
};

class GenerationQueue {
  private active = new Map<string, AbortController>();  // projectId → controller
  private queue: QueueItem[] = [];                       // FIFO
  private listeners = new Map<string, Set<(event: GenerationEvent) => void>>();

  /** Subscribe to events for a project */
  subscribe(projectId: string, callback: (event: GenerationEvent) => void) {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }
    this.listeners.get(projectId)!.add(callback);
    return () => this.listeners.get(projectId)?.delete(callback);
  }

  private emit(projectId: string, event: GenerationEvent) {
    this.listeners.get(projectId)?.forEach((cb) => cb(event));
  }

  get activeCount() { return this.active.size; }
  get queueLength() { return this.queue.length; }
  get status() {
    return {
      activeCount: this.active.size,
      queueLength: this.queue.length,
      maxConcurrent: MAX_CONCURRENT,
      slotAvailable: this.active.size < MAX_CONCURRENT,
    };
  }

  /** Enqueue hoặc dispatch ngay */
  async enqueue(
    projectId: string,
    promptInput: string,
    options: Record<string, unknown>
  ) {
    if (this.active.size >= MAX_CONCURRENT) {
      this.queue.push({ projectId, promptInput, options });
      this.emit(projectId, { type: "queued" });
      return;
    }
    await this.dispatch(projectId, promptInput, options);
  }

  private async dispatch(
    projectId: string,
    promptInput: string,
    options: Record<string, unknown>
  ) {
    const controller = new AbortController();
    this.active.set(projectId, controller);

    try {
      await generateScript(projectId, promptInput, options as any, (event) => {
        this.emit(projectId, event);
      });
    } catch (err) {
      // Error đã emit trong generateScript
    } finally {
      this.active.delete(projectId);
      this.dispatchNext();
    }
  }

  /** Khi 1 slot trống, lấy item từ queue */
  private async dispatchNext() {
    if (this.queue.length === 0) return;
    const next = this.queue.shift()!;
    await this.dispatch(next.projectId, next.promptInput, next.options);
  }
}

// Singleton
export const generationQueue = new GenerationQueue();
```

### 2.7 `src/app/api/projects/[projectId]/generate/route.ts`

SSE endpoint kết hợp với queue:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generationQueue } from "@/lib/ai/generation-queue";
import type { GenerationEvent } from "@/lib/ai/script-generator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Update status → QUEUED (sẽ update lại GENERATING khi dispatch)
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "QUEUED" },
  });

  // SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = generationQueue.subscribe(projectId, (event: GenerationEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

        if (event.type === "completed" || event.type === "error") {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          unsubscribe();
        }
      });
    },
  });

  // Enqueue vào generation queue (async, không block response)
  generationQueue.enqueue(
    projectId,
    project.promptInput || "",
    {
      style: project.style,
      language: project.language,
      targetDuration: project.targetDuration,
      targetPlatform: project.targetPlatform,
      visualStyle: project.visualStyle,
    }
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 2.8 `src/app/api/projects/queue/status/route.ts`

```typescript
import { generationQueue } from "@/lib/ai/generation-queue";

export async function GET() {
  return Response.json(generationQueue.status);
}
```

### 2.9 `src/lib/services/script-service.ts`

```typescript
export async function saveScript(projectId: string, scriptData: Script) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      scriptData: scriptData as any,
      status: "COMPLETED",
      slideCount: scriptData.slides.length,
    },
  });
}

export async function createVersion(projectId: string, scriptData: Script, changelog?: string) {
  const lastVersion = await prisma.scriptVersion.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
  });
  return prisma.scriptVersion.create({
    data: {
      projectId,
      version: (lastVersion?.version || 0) + 1,
      scriptData: scriptData as any,
      changelog,
    },
  });
}

export async function getVersions(projectId: string) {
  return prisma.scriptVersion.findMany({
    where: { projectId },
    orderBy: { version: "desc" },
  });
}
```

### 2.10 `src/app/api/projects/[projectId]/versions/route.ts`

- `GET`: list versions
- `POST`: save new version (manual save)

## Verification

- Tạo 6 projects → trigger generate cho cả 6
- 5 chạy ngay (QUEUED → GENERATING), project thứ 6 ở QUEUED
- Khi 1 hoàn thành → project thứ 6 tự động dispatch
- SSE stream per project nhận đúng events
- `GET /api/projects/queue/status` trả về đúng activeCount, queueLength
- Làm mới trang → queue vẫn hoạt động (in-memory survives within same process)
