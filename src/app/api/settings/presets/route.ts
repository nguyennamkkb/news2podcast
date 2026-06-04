import { LLM_PRESETS } from "@/lib/ai/presets";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(LLM_PRESETS);
}
