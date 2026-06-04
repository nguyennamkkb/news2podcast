# Phase 6 — Trang Cài Đặt & LLM Provider

## Mục tiêu
Trang Settings cho phép cấu hình LLM provider. Hỗ trợ **OpenAI** và **OpenAI-compatible custom** (bất kỳ provider nào tương thích API: Groq, Together, Azure, Ollama, v.v.).

## Tổng quan

```
Người dùng vào /settings → Chọn provider → Nhập API Key + Base URL + Model
→ Test Connection → Lưu cấu hình vào DB
→ Mọi request generate sau đó dùng config này
```

## 1. Data Model

```prisma
model Settings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

Store dạng key-value trong SQLite:

| Key | Default | Mô tả |
|-----|---------|-------|
| `llm_api_key` | `""` | API Key (mã hoá hiển thị) |
| `llm_base_url` | `https://api.openai.com/v1` | Base URL của provider |
| `llm_model` | `gpt-4o` | Tên model |
| `llm_provider` | `openai` | Provider preset name |

## 2. Provider Presets

| Preset | Base URL | Ghi chú |
|--------|----------|---------|
| **OpenAI** | `https://api.openai.com/v1` | Mặc định |
| **Groq** | `https://api.groq.com/openai/v1` | Nhanh, rẻ |
| **Together AI** | `https://api.together.xyz/v1` | Open-source models |
| **Azure OpenAI** | `https://{resource}.openai.azure.com/openai/deployments/{deployment}` | Custom path |
| **Ollama** | `http://localhost:11434/v1` | Local LLM |
| **Custom** | (người dùng tự nhập) | Mọi API OpenAI-compatible |

Khi chọn preset → tự động điền Base URL. Chọn "Custom" → nhập URL tự do.

## 3. API Routes

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/api/settings` | No | Lấy settings (ẩn api key) |
| `PUT` | `/api/settings` | No | Cập nhật settings |
| `POST` | `/api/settings/test` | No | Test connection |
| `GET` | `/api/settings/presets` | No | Danh sách provider presets |

### `GET /api/settings`
```json
{
  "llm_provider": "openai",
  "llm_base_url": "https://api.openai.com/v1",
  "llm_model": "gpt-4o",
  "llm_api_key": "sk-••••abcd"
}
```
API key mask: chỉ hiển thị 4 ký tự đầu + 4 ký tự cuối.

### `PUT /api/settings`
```json
{
  "llm_provider": "custom",
  "llm_base_url": "https://my-llm.com/v1",
  "llm_model": "llama-3-70b",
  "llm_api_key": "sk-new-key"
}
```

### `POST /api/settings/test`
```json
// Request
{
  "apiKey": "sk-...",
  "baseUrl": "https://api.openai.com/v1", 
  "model": "gpt-4o"
}

// Response
{
  "success": true,
  "message": "Connection successful - gpt-4o",
  "latency": 450
}
```

Gọi `chat/completions` với prompt "Hello" → đo latency → trả kết quả.

### `GET /api/settings/presets`
```json
[
  { "id": "openai", "name": "OpenAI", "baseUrl": "https://api.openai.com/v1", "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"] },
  { "id": "groq", "name": "Groq", "baseUrl": "https://api.groq.com/openai/v1", "models": ["llama-3.3-70b", "mixtral-8x7b"] },
  { "id": "together", "name": "Together AI", "baseUrl": "https://api.together.xyz/v1", "models": ["mistral-7b", "llama-3-70b"] },
  { "id": "ollama", "name": "Ollama (Local)", "baseUrl": "http://localhost:11434/v1", "models": ["llama3", "mistral"] },
  { "id": "custom", "name": "Custom (OpenAI Compatible)", "baseUrl": "", "models": [] }
]
```

## 4. UI — Trang `/settings`

### 4.1 Wireframe

```
┌──────┬───────────────────────────────────────────────────────────┐
│ Side │  Settings                                                 │
│ bar  │  ─────────────────────────────────────────────────────── │
│      │                                                          │
│ D    │  ┌────────────────────────────────────────────────────┐  │
│ a    │  │  ⚙️  LLM Provider                         [Saved]  │  │
│ s    │  │  ──────────────────────────────────────────────   │  │
│ h    │  │                                                   │  │
│ b    │  │  Provider                                    [Test]│  │
│ o    │  │  ┌──────────────────────────────────────────┐    │  │
│ a    │  │  │  🌐 OpenAI                         ▼     │    │  │
│ r    │  │  └──────────────────────────────────────────┘    │  │
│ d    │  │                                                   │  │
│      │  │  API Key                                         │  │
│ P    │  │  ┌──────────────────────────────────────────┐    │  │
│ r    │  │  │  sk-••••••••••••••••ABCD        [👁]     │    │  │
│ o    │  │  └──────────────────────────────────────────┘    │  │
│ j    │  │                                                   │  │
│ e    │  │  Base URL                                        │  │
│ c    │  │  ┌──────────────────────────────────────────┐    │  │
│ t    │  │  │  https://api.openai.com/v1               │    │  │
│ s    │  │  └──────────────────────────────────────────┘    │  │
│      │  │                                                   │  │
│ S    │  │  Model                                           │  │
│ e    │  │  ┌──────────────────────────────────────────┐    │  │
│ t    │  │  │  gpt-4o                             ▼    │    │  │
│ t    │  │  └──────────────────────────────────────────┘    │  │
│ i    │  │                                                   │  │
│ n    │  │  ┌────────────────┐                              │  │
│ g    │  │  │   💾 Save      │                              │  │
│ s    │  │  └────────────────┘                              │  │
│      │  │                                                   │  │
│      │  └────────────────────────────────────────────────────┘  │
│      │                                                          │
│      │  ┌────────────────────────────────────────────────────┐  │
│      │  │  📊  Usage                                         │  │
│      │  │  ──────────────────────────────────────────────   │  │
│      │  │  Total requests    42                              │  │
│      │  │  Total tokens      ~125,000                        │  │
│      │  │  Active model      gpt-4o                          │  │
│      │  └────────────────────────────────────────────────────┘  │
└──────┴──────────────────────────────────────────────────────────┘
```

### 4.2 States

**Default (chưa cấu hình):**
- Form trống, dùng defaults
- API Key input trống, placeholder "sk-..."
- Nút Test disabled nếu chưa có API key

**Saving:**
- Nút Save → spinner "Saving..."
- Toast "Settings saved ✅"

**Testing:**
- Nút Test → spinner "Testing..."
- Success: Toast "✅ Connected to gpt-4o (450ms)"
- Error: Toast "❌ Connection failed: Invalid API key"

**Saved:**
- Badge "Saved" màu xanh cạnh title

### 4.3 Interactions

| Action | Behaviour |
|--------|-----------|
| Chọn provider | Auto-fill Base URL + danh sách model suggestions |
| Chọn "Custom" | Enable Base URL input, model input tự do |
| 👁 toggle | Show/hide API key |
| Test | Gọi `/api/settings/test` → toast kết quả |
| Save | Gọi `PUT /api/settings` → toast |
| Enter key | Nếu có key, auto-enable nút Test |

## 5. Integration với AI Pipeline

Sửa `src/lib/ai/openai-client.ts`:

```typescript
import OpenAI from "openai";
import { getSetting } from "@/lib/services/settings-service";

let clientInstance: OpenAI | null = null;
let lastConfig = "";

export async function getOpenAIClient() {
  const [baseUrl, apiKey] = await Promise.all([
    getSetting("llm_base_url", "https://api.openai.com/v1"),
    getSetting("llm_api_key", ""),
  ]);
  
  const configFingerprint = `${baseUrl}|${apiKey}`;
  
  if (!clientInstance || configFingerprint !== lastConfig) {
    clientInstance = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey || process.env.OPENAI_API_KEY || "sk-placeholder",
    });
    lastConfig = configFingerprint;
  }
  
  return clientInstance;
}

export async function getLLMModel() {
  return getSetting("llm_model", "gpt-4o");
}
```

Sửa `script-generator.ts` để dùng client + model từ DB.

## 6. Sidebar

Thêm Settings vào nav:

```
Dashboard
Projects
─────────
Settings
```

Dùng separator để tách Settings xuống dưới.

## 7. Files

| # | File | Mô tả |
|---|------|-------|
| 1 | `prisma/schema.prisma` | Thêm model `Settings` |
| 2 | `src/lib/services/settings-service.ts` | getSetting, setSetting, getAllSettings |
| 3 | `src/lib/ai/presets.ts` | Danh sách provider presets |
| 4 | `src/app/api/settings/route.ts` | GET + PUT |
| 5 | `src/app/api/settings/test/route.ts` | POST test connection |
| 6 | `src/app/api/settings/presets/route.ts` | GET presets list |
| 7 | `src/app/(dashboard)/settings/page.tsx` | Trang settings |
| 8 | `src/components/settings/llm-provider-form.tsx` | Form component |
| 9 | `src/components/settings/usage-stats.tsx` | Usage stats card |
| 10 | `src/components/layout/app-sidebar.tsx` | Thêm nav Settings |
| 11 | `src/lib/ai/openai-client.ts` | Đọc config từ DB |

## 8. Thứ tự triển khai

1. `prisma db push` — thêm Settings table
2. `settings-service.ts` — CRUD settings
3. `presets.ts` — danh sách provider
4. API routes — 3 files
5. `openai-client.ts` — đọc từ DB
6. `script-generator.ts` — dùng client + model từ DB
7. UI components — form + usage stats
8. Page + sidebar

## 9. Verification

- Vào `/settings` → form hiển thị với defaults
- Chọn Groq → base URL tự động `https://api.groq.com/openai/v1`
- Nhập API key Groq → Test → "Connected to llama-3.3-70b (320ms)"
- Save → reload trang → giữ nguyên config
- Generate script → dùng Groq thay vì OpenAI
- Sidebar có Settings
