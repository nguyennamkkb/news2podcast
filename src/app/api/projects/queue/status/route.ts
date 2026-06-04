import { generationQueue } from "@/lib/ai/generation-queue";

export async function GET() {
  return Response.json(generationQueue.status);
}
