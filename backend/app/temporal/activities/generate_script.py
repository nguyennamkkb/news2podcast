import json
import httpx
from temporalio import activity
from app.config import get_settings

SYSTEM_PROMPT = """Bạn là editor video chuyên nghiệp. Từ nội dung bài viết, tạo script cho video news explainer.

LUẬT:
1. Chia nội dung thành {n_slides} slides (hoặc ít hơn nếu nội dung ngắn)
2. Mỗi slide có: title (tiêu đề < 8 từ), bullets (2-3 bullet points), voiceover (script đọc), duration_sec (3-6 giây)
3. Slide đầu là hook, slide cuối là CTA
4. Tone: chuyên nghiệp, khách quan
5. Output PURE JSON, không markdown, không giải thích.

OUTPUT FORMAT:
{{"slides": [{{"title": "string", "bullets": ["string"], "voiceover": "string", "duration_sec": number}}]}}"""


# --- Internal helpers (plain functions, NOT activities) ---

def _call_ollama(api_url: str, model: str, system_prompt: str, prompt: str) -> str:
    """Gọi Ollama API (/api/generate)."""
    payload = {
        "model": model,
        "system": system_prompt,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 2048},
    }
    with httpx.Client(timeout=30.0) as client:
        response = client.post(api_url, json=payload)
        response.raise_for_status()
        result = response.json()
    return result.get("response", "")


def _call_openai(api_url: str, api_key: str, model: str, system_prompt: str, prompt: str) -> str:
    """Gọi OpenAI-compatible API (/v1/chat/completions)."""
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 2048,
    }
    with httpx.Client(timeout=30.0) as client:
        response = client.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
    return result["choices"][0]["message"]["content"]


# --- Temporal activity ---

@activity.defn
async def generate_script(content: dict, config: dict) -> dict:
    settings = get_settings()
    n_slides = config.get("slide_count", 5)
    paragraphs = content.get("paragraphs", [])
    title = content.get("title", "")
    article_text = f"Tiêu đề: {title}\n\n" + "\n".join(paragraphs)

    word_count = content.get("word_count", len(article_text.split()))
    if word_count < 100:
        n_slides = min(n_slides, 3)
    elif word_count < 300:
        n_slides = min(n_slides, 4)

    system_prompt = SYSTEM_PROMPT.format(n_slides=n_slides)

    provider = settings.llm_provider
    if provider == "openai":
        api_url = settings.llm_api_url
        model = settings.llm_model
        raw_response = await _call_openai(api_url, settings.llm_api_key, model, system_prompt, article_text)
    else:
        api_url = settings.ollama_api_url
        model = settings.ollama_model
        raw_response = await _call_ollama(api_url, model, system_prompt, article_text)

    try:
        slides_data = json.loads(raw_response)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{[\s\S]*\}', raw_response)
        if match:
            slides_data = json.loads(match.group(0))
        else:
            raise ValueError(f"Could not parse LLM response: {raw_response[:200]}")

    if "slides" not in slides_data:
        raise ValueError("LLM response missing 'slides' key")

    for slide in slides_data["slides"]:
        if not slide.get("voiceover"):
            slide["voiceover"] = slide.get("title", "") + ". " + ". ".join(slide.get("bullets", []))

    return slides_data