## ADDED Requirements

### Requirement: LLM provider selector
The Settings page External Services section SHALL display a provider selector with two options: "Ollama" and "OpenAI-compatible". Selecting a provider SHALL conditionally show the relevant configuration fields for that provider.

#### Scenario: User selects Ollama provider
- **WHEN** user selects "Ollama" from the provider selector
- **THEN** the Settings page SHALL display Ollama-specific fields: API URL (defaulting to `/api/generate` endpoint) and Model name

#### Scenario: User selects OpenAI-compatible provider
- **WHEN** user selects "OpenAI-compatible" from the provider selector
- **THEN** the Settings page SHALL display OpenAI-specific fields: API URL, API Key, and Model name

### Requirement: OpenAI-compatible configuration fields
When "OpenAI-compatible" is selected, the Settings page SHALL render three input fields: API URL (with placeholder `https://api.openai.com/v1/chat/completions`), API Key (password-type input with visibility toggle), and Model (with placeholder `gpt-4o-mini`).

#### Scenario: API key visibility toggle
- **WHEN** user clicks the eye icon on the API Key field
- **THEN** the API Key field SHALL toggle between masked (`sk-****1234` showing last 4 chars) and full plaintext

#### Scenario: API key auto-masking on save
- **WHEN** user types an API key and the field loses focus
- **THEN** the displayed value SHALL show the masked format showing only the last 4 characters

### Requirement: Per-job LLM config passthrough
The `CreateJobRequest` payload SHALL accept an optional `llm_config` object containing `provider`, `api_url`, `api_key`, and `model`. When provided, the `generate_script` activity SHALL use these values instead of the server-side defaults from `get_settings()`.

#### Scenario: Job created with explicit OpenAI-compatible provider
- **WHEN** a job is created with `llm_config.provider = "openai"`, `llm_config.api_url = "https://api.groq.com/openai/v1/chat/completions"`, `llm_config.api_key = "gsk_xxx"`, `llm_config.model = "llama-3.1-70b"`
- **THEN** the `generate_script` activity SHALL call `_call_openai` with these exact values

#### Scenario: Job created without LLM config
- **WHEN** a job is created with no `llm_config` in the payload
- **THEN** the `generate_script` activity SHALL fall back to `get_settings()` values (server env vars)

#### Scenario: Job created with Ollama provider override
- **WHEN** a job is created with `llm_config.provider = "ollama"`, `llm_config.api_url = "http://localhost:11434/api/generate"`, `llm_config.model = "llama3"`
- **THEN** the `generate_script` activity SHALL call `_call_ollama` with these values

### Requirement: Frontend localStorage LLM config persistence
The `useSettings` hook SHALL persist the selected LLM provider, API URL, API key, and model to localStorage. When the "New Video" page loads, these values SHALL be auto-filled into the job creation payload.

#### Scenario: User changes provider and creates a video
- **WHEN** user selects "OpenAI-compatible" on Settings page, enters API URL, key, and model, then navigates to "New Video" and creates a job
- **THEN** the job creation request SHALL include `llm_config` with the OpenAI-compatible provider and credentials from localStorage

#### Scenario: User switches back to Ollama
- **WHEN** user selects "Ollama" on Settings page and creates a new job
- **THEN** the job creation request SHALL include `llm_config` with `provider = "ollama"` and no API key

### Requirement: Backend API key log redaction
The backend SHALL redact `llm_api_key` from all log output. When logging the incoming job config, the API key SHALL be replaced with `****`.

#### Scenario: Job with API key is logged
- **WHEN** a job arrives with `llm_config.api_key = "sk-abc123def456"`
- **THEN** any log output containing the API key SHALL show `"sk-****456"` (last 4 chars only)

### Requirement: Async LLM client functions
The `_call_ollama` and `_call_openai` helper functions SHALL use `httpx.AsyncClient` instead of synchronous `httpx.Client`, allowing them to be properly awaited in the async Temporal activity context.

#### Scenario: Generate script activity calls LLM
- **WHEN** `generate_script` activity calls `_call_ollama` or `_call_openai` with `await`
- **THEN** the function SHALL execute asynchronously without blocking the event loop and return the LLM response string