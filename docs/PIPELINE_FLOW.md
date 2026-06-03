# News2Video — Pipeline Flow

## Triết lý thiết kế

Hệ thống chia làm 2 giai đoạn rõ rệt:

- **Giai đoạn cốt lõi (Core Pipeline):** Nhập yêu cầu → Tạo kịch bản. Đây là trái tim của sản phẩm. Phải hoàn hảo — input linh hoạt, output chính xác, UI cho phép review và chỉnh sửa trước khi tiếp tục.
- **Giai đoạn sản xuất (Production Pipeline):** TTS → Mix → Align → Render → Convert → Upload → Save. Chạy tự động sau khi user approve kịch bản. Tạm thời rút gọn, tối ưu sau.

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PIPELINE                             │
│                                                             │
│   User Input ──────▶ Parse ──────▶ Generate Script         │
│   (text/md)          (mistune)       (LLM: Ollama/OpenAI)  │
│                                         │                   │
│                                         ▼                   │
│                                   Script Review & Edit      │
│                                   (user approves/edits)     │
│                                         │                   │
│ ════════════════════════════════════════╪═════════════════  │
│                    PRODUCTION PIPELINE   │                   │
│                                         ▼                   │
│   TTS → Mix → Align → Render → Convert → Upload → Save    │
└─────────────────────────────────────────────────────────────┘
```

**Quy trình hiện tại:** Pipeline chạy thẳng từ input đến output, user không thể review kịch bản trước khi tạo video. Đây là vấn đề lớn nhất — user phải chờ 2-5 phút rồi mới biết kịch bản có đúng hay không.

**Mục tiêu:** Thêm bước Script Review giữa Generate Script và TTS, cho phép user xem, chỉnh sửa kịch bản, rồi mới tiếp tục sản xuất video.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────────────────────┐
│  Frontend   │────▶│  FastAPI      │────▶│  Temporal Workflow                     │
│  Next.js    │     │  REST API     │     │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│  :3000      │◀────│  :8000        │◀────│  │parse│ │script│ │tts  │ │ ... │    │
│             │ WS  │               │ WS  │  └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────┘     └──────────────┘     └─────────────────────────────────────────┘
     │                     │                              │
     │ localStorage        │ PostgreSQL   Redis          │ MinIO (S3)
     │ (settings)          │ (jobs, videos) (cache)     │ (video files)
```

**Stack:** Next.js 14 + FastAPI + Temporal + PostgreSQL + Redis + MinIO + Remotion

**Deployment:** Docker Compose — 7 containers (postgres, redis, minio, temporal, temporal-ui, backend, frontend)

---

## Giai đoạn 1: Nhập yêu cầu (User Input)

### Mô tả

User cung cấp nội dung bài viết và cấu hình. Đây là điểm đầu vào duy nhất của hệ thống — mọi thứ bắt đầu từ đây. UI phải cho phép input nhanh, preview ngay, và cấu hình rõ ràng.

### Màn hình New Video (theo UI/UX Proposal)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────┬──────────────────────────────────────┐│
│  │                                  │  Configuration                       ││
│  │  Content                         │  ┌────────────────────────────────┐  ││
│  │  ┌──────────────────────────────┐│  │ Voice                         │  ││
│  │  │ [Paste] [Upload .md] [Upload ││  │ ┌─────────────────────┐ 🔊  │  ││
│  │  │  .txt]                        ││  │ │ Nữ miền Bắc (Hoài My)│    │  ││
│  │  ├──────────────────────────────┤│  │ └─────────────────────┘    │  ││
│  │  │                              ││  │                              │  ││
│  │  │  Paste your markdown or       ││  │ Format                       │  ││
│  │  │  plain text here...           ││  │ [9:16] [16:9]              │  ││
│  │  │                              ││  │                              │  ││
│  │  │                              ││  │ Slides: 5  ──●──────────    │  ││
│  │  │                              ││  │ Duration                    │  ││
│  │  │                              ││  │ [Auto] [30s] [60s] [90s]   │  ││
│  │  │                              ││  │                              │  ││
│  │  │                              ││  │ ☐ Background Music          │  ││
│  │  │                              ││  └────────────────────────────────┘  ││
│  │  └──────────────────────────────┘│                                      ││
│  │  342 words · Vietnamese          │                                      ││
│  └──────────────────────────────────┴──────────────────────────────────────┘│
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │  LLM Provider                                                            ││
│  │  ● Ollama  ○ OpenAI-compatible       [⚡ Test Connection] ✓ Connected  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│              [ ✨ Generate Script ]  · Ollama · qwen3:32b                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data flow — Frontend → Backend

**Nút bấm đổi từ "Generate Video" thành "Generate Script"** — vì bước này chỉ tạo kịch bản, chưa tạo video.

**Payload gửi lên:**
```json
{
  "content": "article text...",
  "config": {
    "voice": "vi-VN-HoaiMyNeural",
    "format": "9x16",
    "outputs": ["9x16", "16x9"],
    "target_duration_sec": 60,
    "slide_count": 5,
    "background_music": null
  },
  "llm_config": {
    "provider": "ollama",
    "api_url": "https://ollama-cloud.example.com/api/generate",
    "model": "qwen3:32b"
  }
}
```

`llm_config` là optional. Khi không có, backend dùng environment variables.

### Validate phía client

- Tối thiểu 10 từ (hiển thị error "Content too short")
- Trên 50.000 từ → warning "Content is very long — video may exceed 5 minutes"
- Language detection: Vietnamese nếu có dấu tiếng Việt, English nếu không
- Word count hiển thị real-time bên dưới textarea
- Nút "Generate Script" disabled khi word count < 10

---

## Giai đoạn 2: Parse + Generate Script (Core Pipeline)

### Step 2.1: API Layer — Job Creation

**File:** `backend/app/api/jobs.py` — `POST /api/v1/jobs`

1. Tạo `Job` record trong PostgreSQL (status: `queued`)
2. Kiểm tra cache — nếu cùng content + config đã xử lý, trả kết quả cached ngay
3. Build `job_input` dict với `job_id`, `content`, `config`, và optional `llm_config`
4. Start Temporal workflow qua `start_news_video_workflow(job_input, workflow_id)`
5. Update job status → `processing`
6. Return `JobResponse` với `job_id`, `status`, `created_at`, `estimated_duration_sec`

**Error handling:** Nếu Temporal start fail, job fallback về `queued` (không phải `failed`).

### Step 2.2: Parse Content

**Activity:** `parse_content` (`backend/app/temporal/activities/parse_content.py`)

**Input:** Raw text string (markdown hoặc plain text)

**Output:**
```json
{
  "title": "Extracted from first H1",
  "headings": [{"level": 1, "text": "..."}],
  "paragraphs": ["paragraph 1", "paragraph 2", ...],
  "code_blocks": ["..."],
  "word_count": 342
}
```

**Method:** Dùng `mistune` parser. Trích xuất:
- **Title** — heading cấp 1 đầu tiên. Nếu không có H1, dùng dòng đầu tiên.
- **Headings** — tất cả headings với cấp độ, cho context structuring
- **Paragraphs** — nội dung text, dùng làm input cho LLM
- **code_blocks** — tách riêng, không đưa vào script
- **word_count** — đếm từ từ paragraphs, dùng để điều chỉnh slide count

**Edge cases:**
- Text rỗng → trả về structure rỗng với word_count = 0
- Chỉ có 1 dòng → title = dòng đó, 1 paragraph ngắn
- Markdown phức tạp (tables, images) → mistune extract text, bỏ HTML tags

**Timeout:** 10s | **Retry:** 3 attempts

### Step 2.3: Generate Script (LLM Call)

**Activity:** `generate_script` (`backend/app/temporal/activities/generate_script.py`)

**Input:** Parsed content dict + config (với optional `llm_config`)

**Output:**
```json
{
  "slides": [
    {
      "title": "Hook: Tiêu đề thu hút",
      "bullets": ["Điểm chính 1", "Điểm chính 2"],
      "voiceover": "Script đọc đầy đủ cho slide này, dài khoảng 2-3 câu.",
      "duration_sec": 4
    }
  ]
}
```

**LLM Selection Logic:**
1. Nếu `llm_config` có trong job input → dùng per-job settings (provider, URL, key, model)
2. Nếu không → fallback về server environment variables

**Ollama call:**
```
POST {api_url}
{
  "model": "qwen3:32b",
  "system": SYSTEM_PROMPT,
  "prompt": article_text,
  "format": "json",
  "stream": false,
  "options": {"temperature": 0.3, "num_predict": 2048}
}
```

**OpenAI-compatible call:**
```
POST {api_url}
Authorization: Bearer {api_key}
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": article_text}
  ],
  "temperature": 0.3,
  "max_tokens": 2048
}
```

**System Prompt:**
```
Bạn là editor video chuyên nghiệp. Từ nội dung bài viết, tạo script cho video news explainer.

LUẬT:
1. Chia nội dung thành {n_slides} slides (hoặc ít hơn nếu nội dung ngắn)
2. Mỗi slide có: title (tiêu đề < 8 từ), bullets (2-3 bullet points), voiceover (script đọc), duration_sec (3-6 giây)
3. Slide đầu là hook, slide cuối là CTA
4. Tone: chuyên nghiệp, khách quan
5. Output PURE JSON, không markdown, không giải thích.

OUTPUT FORMAT:
{{"slides": [{{"title": "string", "bullets": ["string"], "voiceover": "string", "duration_sec": number}}]}}
```

**Slide count adaptation:**
- Dưới 100 từ → tối đa 3 slides
- Dưới 300 từ → tối đa 4 slides
- Mặc định → theo config (5-8)

**JSON repair:** Nếu LLM trả về non-JSON, thử regex extract `{...}` block. Nếu vẫn fail → throw `ValueError`.

**Fallback:** Slide thiếu `voiceover` → auto-generate từ `title + bullets`.

**Timeout:** 30s | **Retry:** 2 attempts

### Script Review (Mục tiêu tương lai — chưa implement)

**Vấn đề hiện tại:** Pipeline chạy thẳng từ input đến video, user không thể review kịch bản. Đây là điểm yếu lớn nhất.

**Đề xuất flow mới:**
```
Generate Script → User Review/Edit → Approve → TTS → Render → Done
                        │
                        └─ Reject → Edit content/config → Re-generate
```

**Implementation cần:**
1. Workflow tạm dừng sau `generate_script`, chờ user approve
2. Frontend hiển thị Script Review page — xem slides, edit title/bullets/voiceover
3. User approve → workflow tiếp tục TTS
4. User reject → cho phép edit và re-run script generation

**Lý do chưa implement:** Cần thay đổi Temporal workflow architecture (pause/resume signal), thêm API endpoint cho approve/reject, và frontend Script Editor component. Đây là tính năng P1 cho phase tiếp theo.

---

## Giai đoạn 3–9: Production Pipeline (Tóm tắt)

Các bước sau chạy tự động sau khi script được generate. Tạm thời rút gọn mô tả.

### Step 3: TTS (Text-to-Speech)

**Activity:** `generate_tts` — Dùng `edge_tts` (Microsoft Edge TTS, free). Mỗi slide → 1 file MP3 riêng. Duration lấy bằng `ffprobe`.

**Timeout:** 30s/slide | **Retry:** 3

### Step 4: Audio Mixing

**Activity:** `mix_audio` — FFmpeg `amix`: voice gốc + BGM -20dB. Bỏ qua nếu không có BGM.

**Timeout:** 60s | **Retry:** 2

### Step 5: Word Alignment (Karaoke Subtitles)

**Activity:** `align_words` — WhisperX `large-v2`. Transcribe → align → word-level timestamps.

**Lưu ý:** Cài whisperx + torch (~4GB). Docker dev mode chạy không có bước này.

**Timeout:** 120s | **Retry:** 2

### Step 6: Video Rendering

**Activity:** `render_video` — Remotion render `NewsVideo` composition → 9:16 MP4 (1080×1920).

**Timeout:** 180s | **Heartbeat:** 30s | **Retry:** 2

### Step 7: Format Conversion

**Activity:** `convert_9x16_to_16x9` — FFmpeg `pad` filter → 16:9 MP4 (1920×1080). Audio copy.

**Timeout:** 60s | **Retry:** 2

### Step 8: Thumbnail + Upload

**Activity:** `generate_thumbnail` — FFmpeg capture frame at 2s → 540px width. Non-blocking nếu fail.

**Activity:** `upload_storage` — Upload videos + thumbnails lên MinIO. Return signed URLs + sizes.

**Timeout:** 120s | **Retry:** 2

### Step 9: Save Result

**Activity:** `save_result` — Tạo `Video` record trong PostgreSQL, mark Job `completed`.

**Final output:**
```json
{
  "video_id": "uuid",
  "title": "Hook title",
  "slide_count": 5,
  "duration_sec": 23.5,
  "url_9x16": "https://minio.../videos/{job_id}_9x16.mp4",
  "url_16x9": "https://minio.../videos/{job_id}_16x9.mp4",
  "thumbnail_url": "https://minio.../thumbnails/{job_id}_9x16.jpg"
}
```

---

## Progress Tracking

**WebSocket:** `ws://localhost:3000/api/v1/ws/jobs/{job_id}`

**Progress steps:**
```
parsing → scripting → tts → mixing → aligning → rendering → converting → uploading → saving
  5%       10%       30%    36%      44%        50%         80%          92%       98%
```

**Frontend:** `ProgressTracker` component — thanh progress tổng + per-step badges (pending → in progress → completed/failed) + step duration khi complete.

**Fallback:** `useJobPolling` poll `GET /api/v1/jobs/{id}` mỗi 2s khi WebSocket unavailable. Stop polling khi `completed` hoặc `failed`.

---

## LLM Config Flow

```
Settings Page (localStorage)
    │
    ├── llmProvider: "ollama" | "openai"
    ├── llmApiUrl: string
    ├── llmApiKey: string (masked trong UI: ****<last4>)
    └── llmModel: string
    │
    ▼
New Video Page build LLMConfig object
    │
    ▼
POST /api/v1/jobs { content, config, llm_config }
    │
    ▼
Temporal workflow pass llm_config → generate_script activity
    │
    ▼
generate_script dùng llm_config (hoặc env fallback)
```

**API key masking:** `mask_api_key()` hiển thị `****<last4>` trong mọi log. Keys không bao giờ được lưu server-side — chỉ đi trong per-job payload.

**Connection testing:** `POST /api/v1/llm/test` gửi minimal prompt để verify endpoint reachability, API key validity, và response format. Return `{success, message, latency_ms}`.

---

## Data Models

### Job (PostgreSQL)
| Field | Type | Mô tả |
|---|---|---|
| id | UUID | Primary key |
| status | string | `queued` → `processing` → `completed` / `failed` / `cancelled` |
| content | text | Original article text |
| config_json | JSON | Video configuration |
| progress_json | JSON | Real-time progress state |
| workflow_id | string | Temporal workflow ID |
| error_message | text | Lỗi nếu fail |
| created_at | datetime | |
| updated_at | datetime | |
| completed_at | datetime | |

### Video (PostgreSQL)
| Field | Type | Mô tả |
|---|---|---|
| id | UUID | Primary key |
| job_id | UUID | FK → Job |
| title | string | Title của slide đầu tiên |
| duration_sec | float | Tổng thời lượng |
| slide_count | int | Số slides |
| language | string | `vi` hoặc `en` |
| format | string | Format chính (9x16 hoặc 16x9) |
| file_9x16_url | string | MinIO URL |
| file_9x16_size | int | Bytes |
| file_16x9_url | string | MinIO URL |
| file_16x9_size | int | Bytes |
| thumbnail_url | string | MinIO URL |
| slides_json | JSON | Full slide data + word timings |

---

## Infrastructure

| Service | Port | Mục đích |
|---|---|---|
| Frontend (Next.js) | 3000 | Web UI |
| Backend (FastAPI) | 8000 | REST API + Temporal worker |
| PostgreSQL | 5432 | Jobs + Videos + progress |
| Redis | 6379 | Caching |
| MinIO | 9000/9001 | S3-compatible video storage |
| Temporal | 7233 | Workflow orchestration |
| Temporal UI | 8080 | Workflow monitoring |

---

## Error Handling

| Tình huống | Xử lý |
|---|---|
| Activity timeout | Retry theo policy (2-3 attempts), rồi workflow fail |
| Activity exception | Workflow catch → `mark_job_failed` → re-raise |
| Temporal start fail | Job status → `queued` (không phải `failed`) |
| Thumbnail fail | Non-blocking — continue với empty thumbnail URL |
| WhisperX not installed | Worker start không có; `align_words` unavailable |
| Cache hit | Return completed job ngay, không start workflow |
| LLM trả về non-JSON | Regex extract `{...}`, rồi fail với parse error |
| User cancel job | Temporal workflow cancelled, job status → `cancelled` |

---

## Điểm cần cải thiện (Next Phase)

1. **Script Review step** — Cho phép user xem và chỉnh sửa kịch bản trước khi tạo video. Cần Temporal signal (pause/resume) và Script Editor UI.
2. **Batch processing** — Upload nhiều bài viết, tạo nhiều video cùng lúc.
3. **Template system** — Lưu cấu hình hay dùng (voice + format + slide count) thành template.
4. **Voice preview** — Nghe thử giọng đọc thực tế bằng Edge TTS, không chỉ browser SpeechSynthesis.
5. **Script versioning** — Lưu lịch sử chỉnh sửa kịch bản, cho phép rollback.