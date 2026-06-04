import { z } from "zod";

const ALLOWED_KEYS = [
  "llm_provider",
  "llm_api_key",
  "llm_base_url",
  "llm_model",
  "background_music",
] as const;

export const updateSettingsSchema = z.record(
  z.enum(ALLOWED_KEYS),
  z.string().max(2000)
);

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      return false;
    }
    const hostname = parsed.hostname;
    if (
      hostname === "169.254.169.254" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}