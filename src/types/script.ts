// Types are derived from Zod schemas in @/lib/validators/script.
// The validators are the canonical source of truth.
export type { Script, Slide } from "@/lib/validators/script";

/** @deprecated Import from @/lib/validators/script instead */
export type SlideType = "intro" | "content" | "transition" | "outro" | "cta";
/** @deprecated Import from @/lib/validators/script instead */
export type TransitionType = "fade" | "slide_left" | "slide_right" | "slide_up" | "slide_down" | "zoom_in" | "zoom_out" | "dissolve" | "wipe" | "none";
/** @deprecated Import from @/lib/validators/script instead */
export type VisualStyle = "realistic" | "cartoon" | "3d_render" | "flat_illustration" | "minimalist" | "cinematic" | "infographic";