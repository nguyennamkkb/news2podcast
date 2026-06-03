## Context

The News2Video backend already supports two LLM providers: Ollama (native API at `/api/generate`) and OpenAI-compatible (`/v1/chat/completions`). The dispatch logic in `generate_script.py` routes based on `settings.llm_provider`. However, the frontend Settings page only exposes Ollama configuration, and the frontend ↔ backend are fully disconnected — frontend settings persist to localStorage only, never reaching the backend. The backend reads LLM config from environment variables at startup with no runtime update mechanism.

Current architecture:
- `backend/app/config.py` — 7 LLM fields (llm_provider, llm_api_url, llm_api_key, llm_model + ollama_api_url, ollama_model)
- `generate_script.py` — `_call_ollama()` (sync) and `_call_openai()` (sync) dispatched by `if provider == "openai"`
- Frontend `useSettings.ts` — `ollamaApiUrl` + `ollamaModel` only, localStorage, never sent to backend
- Frontend `settings/page.tsx` — single "Ollama Cloud" card under External Services

## Goals / Non-Goals

**Goals:**
- Let users choose between Ollama and any OpenAI-compatible provider (Groq, Together AI, LM Studio, OpenAI, etc.) from the Settings page
- Per-job LLM config passthrough so the same server can serve different providers for different jobs
- API key masking in the UI (show `sk-****1234` pattern)
- Fix the existing async bug in `generate_script.py` (sync functions called with `await`)

**Non-Goals:**
- Server-side encrypted API key storage in the database (future — for now keys travel per-job in the request payload, same security posture as API keys in `.env`)
- Provider-specific parameter tuning (temperature, top_p, etc.) beyond what already exists
- LLM provider health-check / test-connection endpoint (future)

## Decisions

### D1: Per-job LLM config passthrough (not server-side settings API)

**Decision**: Extend `VideoConfig` / `CreateJobRequest` with LLM fields. Frontend sends the active LLM config when creating a job. Backend reads from the job payload, falling back to `get_settings()` defaults if not provided.

**Why over alternatives**:
- **Alternative A (settings CRUD API + DB)**: Requires new DB table, encryption for API keys, settings CRUD routes, cache invalidation. Over-engineering for a single-user dev tool.
- **Alternative B (env-only, no UI control)**: Requires restarting the server to switch providers. Completely defeats the purpose.
- **Per-job passthrough**: Simplest, no new DB schema, no encryption burden, naturally supports running Ollama for some jobs and Groq for others. Same security model as `.env` (keys in clear text in transit, HTTPS mitigates).

### D2: Frontend localStorage retains the "last used" LLM config

**Decision**: The `useSettings` hook stores the user's preferred LLM provider + credentials in localStorage. On "New Video" creation, these are auto-filled into the `CreateJobRequest`. Users can override per-job if desired.

**Why**: This preserves the existing UX pattern (settings → defaults → auto-fill on creation) without needing a backend settings endpoint.

### D3: API key masking in UI

**Decision**: Use a password-type `<Input>` with a toggle-visibility button for the API key field. Display the masked key (`sk-****1234`) based on the last 4 characters. The full key is only visible when the user clicks the eye icon.

**Why**: Balances convenience (see which key is configured) with basic security (shoulder-surfing protection). The key is always sent to the backend over HTTPS.

### D4: Fix async bug in generate_script.py

**Decision**: Convert `_call_ollama` and `_call_openai` to use `httpx.AsyncClient` so they can properly be awaited. Current code uses sync `httpx.Client` but calls them with `await`, which will fail at runtime.

**Why**: This is a latent bug that will surface as soon as a job actually runs. Fixing now prevents a runtime crash.

### D5: Unify LLM config fields

**Decision**: Replace the separate `ollamaApiUrl`/`ollamaModel` fields with a unified `llmProvider` enum + `llmApiUrl`/`llmApiKey`/`llmModel` that works for both providers. When `llmProvider == "ollama"`, `llmApiUrl` defaults to the Ollama endpoint (`/api/generate`).

**Why**: Eliminates duplicate field confusion. The backend config already has all these fields — the frontend just needs to expose them properly.

## Risks / Trade-offs

- **[API keys in localStorage]** → XSS can exfil. Mitigation: This is a self-hosted single-user dev tool on a trusted Mac Studio. HTTPS in transit. For multi-user deployment, add server-side encrypted storage.
- **[Per-job config means keys repeat in every job payload]** → Log redaction. Mitigation: Backend logs must redact `llm_api_key` on receipt. Add `llm_api_key` to a log-redaction list.
- **[generate_script.py async fix]** → Could break if the function signatures change. Mitigation: Test script exists at `backend/scripts/test_pipeline.py`.