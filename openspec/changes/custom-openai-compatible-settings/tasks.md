## 1. Backend: Types & Config

- [ ] 1.1 Add `LLMConfig` Pydantic model to `shared/types.ts` with fields: `provider` (Literal["ollama", "openai"]), `api_url` (str), `api_key` (str, optional), `model` (str)
- [ ] 1.2 Add `LLMConfig` Python model to `backend/app/schemas.py` matching the TypeScript type
- [ ] 1.3 Add `llm_config` optional field to `VideoConfig` in both `shared/types.ts` and `backend/app/schemas.py`
- [ ] 1.4 Add `llm_api_key` to log-redaction list in backend logging config (mask in all log output)

## 2. Backend: Fix Async LLM Functions

- [ ] 2.1 Convert `_call_ollama()` in `generate_script.py` to async using `httpx.AsyncClient` with proper `async with` and `await`
- [ ] 2.2 Convert `_call_openai()` in `generate_script.py` to async using `httpx.AsyncClient` with proper `async with` and `await`
- [ ] 2.3 Update `generate_script` activity to accept `llm_config` from the activity input, falling back to `get_settings()` when not provided
- [ ] 2.4 Route LLM calls based on `llm_config.provider` (or `settings.llm_provider` as fallback) with per-job override values for api_url, api_key, model

## 3. Backend: API & Job Flow

- [ ] 3.1 Update `jobs` router to accept `llm_config` in the `CreateJobRequest` payload and pass it through to the Temporal workflow
- [ ] 3.2 Update Temporal workflow signature to accept `llm_config` and pass it to the `generate_script` activity call
- [ ] 3.3 Add API key masking in job creation logs (print `sk-****<last4>` in any log that contains llm_api_key)

## 4. Frontend: Types & Hook

- [ ] 4.1 Add `llmProvider`, `llmApiUrl`, `llmApiKey`, `llmModel` fields to `UserSettings` interface in `useSettings.ts`
- [ ] 4.2 Update `DEFAULTS` object in `useSettings.ts` with values: `llmProvider: "ollama"`, `llmApiUrl: ""`, `llmApiKey: ""`, `llmModel: "qwen3:32b"`
- [ ] 4.3 Add `LLMConfig` type to `frontend/src/lib/types.ts`
- [ ] 4.4 Update `createJob()` in `frontend/src/lib/api.ts` to include `llm_config` in the request payload (built from current useSettings values)

## 5. Frontend: Settings Page UI

- [ ] 5.1 Replace single "Ollama Cloud" card with a provider-aware "LLM Provider" card containing a Select for "Ollama" / "OpenAI-compatible"
- [ ] 5.2 When "Ollama" selected: show API URL input (placeholder: Ollama `/api/generate` endpoint) and Model input
- [ ] 5.3 When "OpenAI-compatible" selected: show API URL input (placeholder: `https://api.openai.com/v1/chat/completions`), API Key input (password type with Eye icon toggle), and Model input (placeholder: `gpt-4o-mini`)
- [ ] 5.4 Implement API key masking: display last 4 chars only when field is not focused, show full key on focus/eye-toggle
- [ ] 5.5 Wire all new inputs to `saveSettings()` calls to persist to localStorage

## 6. Frontend: New Video Page Integration

- [ ] 6.1 On "New Video" page, read `llmProvider`, `llmApiUrl`, `llmApiKey`, `llmModel` from `useSettings` and include them as `llm_config` in the `createJob` mutation payload
- [ ] 6.2 Show current LLM provider as a small badge/label below the "Generate" button so user knows which provider will be used

## 7. Verification

- [ ] 7.1 Start dev stack with `docker compose up -d` and verify Settings page renders with new provider selector
- [ ] 7.2 Test switching between Ollama and OpenAI-compatible — fields should show/hide correctly
- [ ] 7.3 Test API key masking — verify it shows `****<last4>` and eye toggle works
- [ ] 7.4 Create a test job with `llm_provider=ollama` and verify `generate_script` uses the correct LLM config from the payload
- [ ] 7.5 Run `lsp_diagnostics` on all changed files — zero type errors