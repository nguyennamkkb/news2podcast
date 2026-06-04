import { z } from "zod";
import { ScriptSchema } from "./script";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
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
  scriptData: ScriptSchema.optional(),
  status: z.enum(["DRAFT", "QUEUED", "GENERATING", "COMPLETED", "FAILED", "ARCHIVED"]).optional(),
  slideCount: z.number().int().optional(),
  promptInput: z.string().optional(),
  style: z.string().optional(),
  language: z.string().optional(),
  targetPlatform: z.string().optional(),
  visualStyle: z.string().optional(),
  targetDuration: z.number().int().min(30).max(3600).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;