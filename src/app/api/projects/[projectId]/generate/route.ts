import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generationQueue } from "@/lib/ai/generation-queue";
import type { GenerationEvent } from "@/lib/ai/script-generator";
import { apiError } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/utils/api-handler";

type Ctx = { params: Record<string, string> | Promise<Record<string, string>> };

export const POST = withErrorHandler(
  async (_req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return apiError("Project not found", 404);
    }

    if (["QUEUED", "GENERATING"].includes(project.status)) {
      return apiError("Project is already being generated", 409);
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "QUEUED" },
    });

    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | undefined;

    const stream = new ReadableStream({
      start(controller) {
        unsubscribe = generationQueue.subscribe(
          projectId,
          (event: GenerationEvent) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );

            if (event.type === "completed" || event.type === "error") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              unsubscribe?.();
            }
          }
        );
      },
      cancel() {
        unsubscribe?.();
      },
    });

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
);