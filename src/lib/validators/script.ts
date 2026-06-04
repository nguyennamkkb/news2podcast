import { z } from "zod";

export const SlideType = z.enum(["intro", "content", "transition", "outro", "cta"]);
export const TransitionType = z.enum([
  "fade", "slide_left", "slide_right", "slide_up", "slide_down",
  "zoom_in", "zoom_out", "dissolve", "wipe", "none",
]);
export const VisualStyle = z.enum([
  "realistic", "cartoon", "3d_render", "flat_illustration",
  "minimalist", "cinematic", "infographic",
]);

export const SlideSchema = z.object({
  id: z.string().regex(/^slide-\d+$/),
  type: SlideType,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  subtitle: z.string().max(500).optional(),
  visualDescription: z.string().min(1).max(1000),
  duration: z.number().int().min(5).max(120),
  transition: TransitionType.default("fade"),
  notes: z.string().max(1000).optional(),
  keywords: z.array(z.string()).optional(),
});

export const ScriptSchema = z.object({
  version: z.literal("1.0"),
  title: z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  language: z.string().default("vi"),
  totalDuration: z.number().int().min(10).max(3600),
  visualStyle: VisualStyle.default("cinematic"),
  targetPlatform: z.enum(["youtube", "tiktok", "facebook", "generic"]).default("youtube"),
  slides: z.array(SlideSchema).min(1).max(100),
  metadata: z.object({
    generatedBy: z.string(),
    model: z.string(),
    tokensUsed: z.number().optional(),
    generatedAt: z.string().datetime(),
  }).optional(),
});

export type Script = z.infer<typeof ScriptSchema>;
export type Slide = z.infer<typeof SlideSchema>;
