import { sanitizePromptInput } from "./utils";

export function buildResearchPrompt(topic: string, language: string): string {
  const sanitizedTopic = sanitizePromptInput(topic);
  const lang = language === "vi" ? "tiếng Việt" : "English";
  return `Bạn là researcher chuyên nghiên cứu chủ đề để viết kịch bản video.
Phân tích sâu chủ đề sau, đưa ra key points, số liệu, insights:

${sanitizedTopic}

Trả lời bằng ${lang}.`;
}
