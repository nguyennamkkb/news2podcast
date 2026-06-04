import { ScriptSchema, type Script } from "@/lib/validators/script";

export class ScriptValidationError extends Error {
  constructor(
    message: string,
    public details: unknown
  ) {
    super(message);
    this.name = "ScriptValidationError";
  }
}

/** Strip markdown code blocks and extra whitespace */
function cleanJSON(raw: string): string {
  let cleaned = raw.trim();

  // Remove ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Sometimes JSON is embedded in text - find first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export function validateScript(rawOutput: string): Script {
  const cleaned = cleanJSON(rawOutput);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new ScriptValidationError(
      `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`,
      cleaned.slice(0, 200)
    );
  }

  const result = ScriptSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new ScriptValidationError(
      `Schema validation failed: ${issues}`,
      result.error.issues
    );
  }

  return result.data;
}

export async function generateWithRetry(
  generateFn: () => Promise<string>,
  onValidate: (attempt: number) => void,
  maxRetries = 3
): Promise<Script> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        onValidate(attempt);
      }
      const rawOutput = await generateFn();
      return validateScript(rawOutput);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxRetries) throw lastError;
      console.warn(`[validate] attempt ${attempt}/${maxRetries} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Unknown error");
}
