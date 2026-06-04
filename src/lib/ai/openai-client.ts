import OpenAI from "openai";
import { getSetting } from "@/lib/services/settings-service";

let clientInstance: OpenAI | null = null;
let lastConfig = "";

export async function getOpenAIClient() {
  const [baseUrl, apiKey] = await Promise.all([
    getSetting("llm_base_url", "https://api.openai.com/v1"),
    getSetting("llm_api_key", process.env.OPENAI_API_KEY || ""),
  ]);

  const configFingerprint = `${baseUrl}|${apiKey}`;

  if (!clientInstance || configFingerprint !== lastConfig) {
    clientInstance = new OpenAI({
      baseURL: baseUrl || "https://api.openai.com/v1",
      apiKey: apiKey || "sk-placeholder",
      timeout: 30_000,
    });
    lastConfig = configFingerprint;
  }

  return clientInstance;
}

export async function getLLMModel(): Promise<string> {
  return getSetting("llm_model", "gpt-4o");
}

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; temperature?: number; responseFormat?: "json_object" | "text" }
) {
  const client = await getOpenAIClient();
  const model = options?.model || (await getLLMModel());

  const response = await client.chat.completions.create({
    model,
    temperature: options?.temperature ?? 0.7,
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
