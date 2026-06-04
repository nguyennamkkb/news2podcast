import { chatCompletion } from "./openai-client";
import { buildResearchPrompt } from "./prompts/research-prompt";
import { buildScriptGenPrompt } from "./prompts/script-gen-prompt";
import { validateScript } from "./script-validator";
import { prisma } from "@/lib/prisma";
import type { Script } from "@/lib/validators/script";

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
  options: {
    style?: string;
    language?: string;
    targetDuration?: number;
    targetPlatform?: string;
    visualStyle?: string;
  },
  onProgress: (event: GenerationEvent) => void
) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "GENERATING" },
    });

    onProgress({ type: "researching" });
    const researchResponse = await chatCompletion(
      "Bạn là researcher chuyên nghiên cứu chủ đề để viết kịch bản video.",
      buildResearchPrompt(promptInput, options.language || "vi"),
      { temperature: 0.5 }
    );
    const researchContent = researchResponse.choices[0]?.message?.content || "";

    onProgress({ type: "generating" });
    let script: Script | null = null;
    let genTokens = 0;
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          onProgress({ type: "validating", attempt });
        }
        const genResponse = await chatCompletion(
          buildScriptGenPrompt(researchContent, {
            language: options.language,
            targetDuration: options.targetDuration,
            style: options.style,
            targetPlatform: options.targetPlatform,
            visualStyle: options.visualStyle,
          }),
          "Hãy tạo kịch bản video JSON theo schema.",
          { responseFormat: "json_object", temperature: 0.7 }
        );
        const rawOutput = genResponse.choices[0]?.message?.content || "";
        script = validateScript(rawOutput);
        genTokens = genResponse.usage?.total_tokens ?? 0;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === maxRetries) throw lastError;
        console.warn(`[validate] attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      }
    }

    if (!script) throw lastError ?? new Error("Unknown error");

    const totalTokens = (researchResponse.usage?.total_tokens ?? 0) + genTokens;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "COMPLETED",
        scriptData: JSON.stringify(script),
        slideCount: script.slides.length,
        aiModel: "gpt-4o",
        aiTokensUsed: totalTokens || null,
      },
    });

    await prisma.scriptVersion.create({
      data: {
        projectId,
        version: 1,
        scriptData: JSON.stringify(script),
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
