## Why

The Settings page only exposes Ollama Cloud configuration, but the backend already supports any OpenAI-compatible endpoint (Groq, Together AI, LM Studio, OpenAI, etc.) via the `llm_provider=openai` path. Users cannot configure or switch between providers from the UI — they must edit `.env` files manually. This blocks real-world usage where free-tier Ollama Cloud may have rate limits and users want to use their own API keys with faster providers.

## What Changes

- Add LLM provider selector (Ollama / OpenAI-compatible) to the Settings page External Services section
- When "OpenAI-compatible" is selected, show API URL, API Key, and Model fields; when "Ollama" is selected, show Ollama API URL and Model fields
- Add a backend `/api/v1/settings` endpoint to persist and read LLM provider settings server-side (currently frontend-only localStorage)
- Make the `generate_script` activity read provider settings dynamically per-job instead of only from env vars at startup
- Add API key masking in the UI (show `sk-****1234` pattern)

## Capabilities

### New Capabilities

- `llm-provider-settings`: UI + API for configuring which LLM provider to use (Ollama or OpenAI-compatible), including API URL, API key, and model name, with server-side persistence and per-job config passthrough

### Modified Capabilities

## Impact

- **Frontend**: `settings/page.tsx` (External Services section expanded), `useSettings.ts` (new fields), `lib/types.ts` (LLM config types)
- **Backend**: New `/api/v1/settings` CRUD endpoint, `app/config.py` (dynamic settings), `generate_script.py` (read settings per-job)
- **API**: New settings REST endpoint, possible job creation payload extension (per-job LLM override)
- **Dependencies**: No new packages — uses existing shadcn/ui components (Select, Input) and httpx