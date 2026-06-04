import { sanitizeResearchContent } from "./utils";

export function buildScriptGenPrompt(
  researchContent: string,
  options: {
    language?: string;
    targetDuration?: number;
    style?: string;
    targetPlatform?: string;
    visualStyle?: string;
  }
): string {
  const sanitizedResearch = sanitizeResearchContent(researchContent);
  const lang = options.language === "vi" ? "tiếng Việt" : "English";

  return `Dựa trên research sau, tạo kịch bản video dạng JSON.

RESEARCH:
${sanitizedResearch}

YÊU CẦU:
- Tổng duration: khoảng ${options.targetDuration || 300} giây
- Ngôn ngữ: ${lang}
- Phong cách: ${options.style || "professional"}
- Platform: ${options.targetPlatform || "youtube"}
- Visual style: ${options.visualStyle || "cinematic"}

OUTPUT FORMAT - Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "version": "1.0",
  "title": "Video title here",
  "description": "Short description",
  "language": "${options.language || "vi"}",
  "totalDuration": ${options.targetDuration || 300},
  "visualStyle": "${options.visualStyle || "cinematic"}",
  "targetPlatform": "${options.targetPlatform || "youtube"}",
  "slides": [
    {
      "id": "slide-1",
      "type": "intro",
      "title": "Slide title",
      "content": "Main content text for this slide",
      "subtitle": "Optional subtitle for video caption",
      "visualDescription": "Detailed visual description for AI image generation - describe the scene, colors, composition, style",
      "duration": 30,
      "transition": "fade",
      "notes": "Optional director notes",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "metadata": {
    "generatedBy": "script-creator",
    "model": "gpt-4o",
    "generatedAt": "2024-01-01T00:00:00Z"
  }
}

IMPORTANT RULES:
- Return ONLY the JSON object, no markdown formatting, no \`\`\`json blocks
- Each slide MUST have a detailed visualDescription for AI image generation
- Slide id format: "slide-1", "slide-2", etc.
- Slide types: intro, content, transition, outro, cta
- Transition options: fade, slide_left, slide_right, zoom_in, dissolve, none
- Duration per slide: 5-120 seconds
- Total slide durations should sum to roughly totalDuration`;
}
