import { NextRequest } from "next/server";
import OpenAI from "openai";
import { isAllowedUrl } from "@/lib/validators/settings";
import { withErrorHandler } from "@/lib/utils/api-handler";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { apiKey, baseUrl, model } = await req.json();

  if (!apiKey) {
    return Response.json({ success: false, message: "API key is required" }, { status: 400 });
  }
  if (!baseUrl) {
    return Response.json({ success: false, message: "Base URL is required" }, { status: 400 });
  }
  if (!model) {
    return Response.json({ success: false, message: "Model is required" }, { status: 400 });
  }

  if (!isAllowedUrl(baseUrl)) {
    return Response.json({ success: false, message: "Base URL not allowed" }, { status: 400 });
  }

  const start = Date.now();
  try {
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
      timeout: 10000,
    });

    await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    });

    const latency = Date.now() - start;
    return Response.json({
      success: true,
      message: `Connected to ${model}`,
      latency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    const latency = Date.now() - start;
    return Response.json({
      success: false,
      message: message.length > 100 ? message.slice(0, 100) + "..." : message,
      latency,
    }, { status: 200 });
  }
});