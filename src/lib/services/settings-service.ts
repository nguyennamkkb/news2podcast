import { prisma } from "@/lib/prisma";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Not encrypted (legacy plain text)
    return encryptedText;
  }
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const defaults: Record<string, string> = {
  llm_provider: "openai",
  llm_api_key: "",
  llm_base_url: "https://api.openai.com/v1",
  llm_model: "gpt-4o",
};

export async function getSetting(key: string, defaultValue?: string): Promise<string> {
  const row = await prisma.settings.findUnique({ where: { key } });
  const value = row?.value ?? defaultValue ?? defaults[key] ?? "";
  if (key === "llm_api_key" && value && value.includes(":")) {
    return decrypt(value);
  }
  return value;
}

export async function setSetting(key: string, value: string) {
  const storedValue = key === "llm_api_key" && ENCRYPTION_KEY ? encrypt(value) : value;
  return prisma.settings.upsert({
    where: { key },
    update: { value: storedValue },
    create: { key, value: storedValue },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.settings.findMany();
  const result: Record<string, string> = { ...defaults };
  for (const row of rows) {
    if (row.key === "llm_api_key" && row.value && row.value.includes(":")) {
      result[row.key] = decrypt(row.value);
    } else {
      result[row.key] = row.value;
    }
  }
  // Mask API key
  if (result.llm_api_key) {
    const key = result.llm_api_key;
    result.llm_api_key = key.length > 8
      ? key.slice(0, 4) + "•".repeat(Math.min(key.length - 8, 12)) + key.slice(-4)
      : key;
  }
  return result;
}

function encryptIfNeeded(key: string, value: string): string {
  return key === "llm_api_key" && ENCRYPTION_KEY ? encrypt(value) : value;
}

export async function updateSettings(data: Record<string, string>) {
  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: encryptIfNeeded(key, value) },
        create: { key, value: encryptIfNeeded(key, value) },
      })
    )
  );
  return getAllSettings();
}