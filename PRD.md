# News2Video — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** 2026-06-02  
> **Status:** Draft — Ready for MVP Development  
> **Author:** Research & Architecture Team

---

## Mục Lục

1. [Executive Summary](#1-executive-summary)
2. [Problem & Solution](#2-problem--solution)
3. [User Personas](#3-user-personas)
4. [Core Features (MVP)](#4-core-features-mvp)
5. [User Flow](#5-user-flow)
6. [Web Interface Design](#6-web-interface-design)
7. [Technical Architecture](#7-technical-architecture)
8. [API Design](#8-api-design)
9. [Database Schema](#9-database-schema)
10. [Video Pipeline Detail](#10-video-pipeline-detail)
11. [Development Milestones](#11-development-milestones)
12. [Success Metrics](#12-success-metrics)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

**News2Video** là công cụ tự động biến nội dung văn bản (Markdown / Plain Text) thành video news explainer chuyên nghiệp dài 30s–2 phút, có giọng đọc AI song ngữ Việt–Anh, phụ đề karaoke, và animation slide mượt mà. Hỗ trợ cả định dạng 9:16 (TikTok/Shorts) và 16:9 (YouTube).

**Key differentiators:**
- 🚀 **End-to-end tự động:** Paste text → Click generate → Video hoàn chỉnh (không cần edit thủ công)
- 💰 **Chi phí ~$0/video:** Ollama Cloud (LLM miễn phí) + Edge TTS (miễn phí) + Remotion self-host
- 🎬 **Production quality:** Dark theme chuyên nghiệp, karaoke subtitle, transition mượt
- 🌐 **Web interface:** Quản lý tiến trình, preview, download, lịch sử

---

## 2. Problem & Solution

### Problem

Người làm content (nhà báo, blogger, KOL, agency) muốn chuyển bài viết thành video nhanh chóng, nhưng gặp 3 vấn đề:

| Vấn đề | Hiện trạng |
|--------|-----------|
| **Thời gian** | Edit video thủ công mất 30–120 phút / 1 video |
| **Chi phí** | Thuê editor $15–50/video hoặc dùng tool SaaS $50–500/tháng |
| **Kỹ năng** | Cần biết Premiere/CapCut + thiết kế + voiceover |

### Solution

News2Video tự động hóa toàn bộ pipeline: đọc text → AI phân tích & viết script → AI đọc giọng → render video chuyên nghiệp. Người dùng chỉ cần paste nội dung và chọn giọng đọc.

| Trước | Sau (News2Video) |
|-------|------------------|
| Mở Premiere/CapCut | Mở trình duyệt web |
| Cắt ghép 30–120 phút | Bấm Generate → 2–3 phút |
| Thuê voice actor / tự thu | AI giọng đọc tự động |
| Thiết kế slide thủ công | AI auto-layout professional |
| Export, upload thủ công | Download MP4 ngay |

---

## 3. User Personas

### Persona A: Nhà báo / Content Creator

| Thuộc tính | Mô tả |
|-----------|-------|
| **Tên** | Minh, 28 tuổi |
| **Vai trò** | Phóng viên báo điện tử, TikTok creator |
| **Mục tiêu** | Chuyển 5–10 bài báo/ngày thành video Shorts để đăng TikTok, Facebook Reels |
| **Pain points** | Mất quá nhiều thời gian edit, chất lượng không đồng đều |
| **Tech level** | Trung bình — dùng được web app, không code |
| **Ngôn ngữ** | Tiếng Việt |
| **Volume** | 20–50 video/tuần |

### Persona B: Agency / Production House

| Thuộc tính | Mô tả |
|-----------|-------|
| **Tên** | Lan, 35 tuổi |
| **Vai trò** | Giám đốc sản xuất content agency |
| **Mục tiêu** | Tự động hóa sản xuất video cho 10+ khách hàng, giảm 80% chi phí editor |
| **Pain points** | Chi phí editor cao ($500–2000/tháng/khách), scaling khó |
| **Tech level** | Trung bình — cần dashboard quản lý batch |
| **Ngôn ngữ** | Việt + Anh |
| **Volume** | 100–500 video/tuần |

---

## 4. Core Features (MVP)

### 4.1 Feature Overview

```
┌─────────────────────────────────────────────────┐
│               MVP FEATURE MAP                    │
├─────────────────────────────────────────────────┤
│                                                   │
│  📝 Content Input                                 │
│  ├─ Paste Markdown / Plain Text                   │
│  ├─ Upload .md / .txt file                        │
│  └─ Auto-detect language (vi/en)                  │
│                                                   │
│  ⚙️  Configure                                     │
│  ├─ Select voice (male/female, vi/en)             │
│  ├─ Select output format (9:16 / 16:9 / cả 2)    │
│  ├─ Target duration (30s / 60s / 90s / auto)      │
│  └─ Number of slides (4 / 5 / 6 / auto)           │
│                                                   │
│  🚀 Generate                                      │
│  ├─ One-click generate                            │
│  ├─ Real-time progress bar (step-by-step)         │
│  └─ Cancel / Retry support                        │
│                                                   │
│  📹 Output                                        │
│  ├─ Preview video inline (HTML5 player)           │
│  ├─ Download MP4 (9:16 + 16:9)                    │
│  └─ Share link (optional, Phase 2)                │
│                                                   │
│  📊 History                                       │
│  ├─ List all generated videos                     │
│  ├─ Filter by status, date, language              │
│  └─ Re-generate with different settings           │
│                                                   │
│  ⚙️  Settings                                      │
│  ├─ Default voice preference                      │
│  ├─ Default output format                         │
│  └─ Ollama Cloud endpoint config                  │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 4.2 Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Paste text → Generate → Download | Medium | 🔴 Critical |
| **P0** | Real-time progress tracking | Medium | 🔴 Critical |
| **P0** | Video preview (HTML5 player) | Small | 🔴 Critical |
| **P1** | File upload (.md/.txt) | Small | 🟡 High |
| **P1** | History with re-generate | Medium | 🟡 High |
| **P1** | Auto-detect language | Small | 🟡 High |
| **P2** | Batch generate (multiple articles) | Large | 🟢 Medium |
| **P2** | Custom voice cloning | Large | 🟢 Medium |
| **P2** | Share link / CDN | Medium | 🟢 Medium |

---

## 5. User Flow

### 5.1 Happy Path (Generate 1 video)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Mở app  │───▶│  Paste   │───▶│  Config  │───▶│ Generate │───▶│ Download │
│  (web)   │    │  content │    │  voice,  │    │  & wait  │    │  MP4     │
│          │    │          │    │  format  │    │  ~2 min  │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
                                         ┌──────────────────────┐
                                         │  Progress tracking:  │
                                         │  ████░░░░ 60%        │
                                         │  Rendering video...  │
                                         └──────────────────────┘
```

### 5.2 Detailed User Journey

| Step | User Action | System Response | Duration |
|------|------------|-----------------|----------|
| 1 | Mở app, thấy Dashboard | Hiển thị stats, recent videos | Instant |
| 2 | Click "New Video" | Hiển thị form input + config | Instant |
| 3 | Paste markdown vào textarea | Real-time word count, auto-detect language | Instant |
| 4 | Chọn voice: "Nữ miền Bắc" | Preview voice sample (nếu có) | Instant |
| 5 | Chọn format: "9:16" | Show preview aspect ratio icon | Instant |
| 6 | Click "Generate Video" | Button disabled, progress bar xuất hiện | — |
| 7 | Đợi | Progress: "Parsing → Scripting → TTS → Rendering → Done" | 2–3 min |
| 8 | Video hoàn thành | Auto-play preview, download button xuất hiện | Instant |
| 9 | Click "Download 9:16" | Tải MP4 về máy | 5–30s |
| 10 | Xem History | Video mới trong list, có thể re-generate | — |

### 5.3 Error Flow

| Error | User sees | Action |
|-------|-----------|--------|
| Ollama Cloud timeout | "LLM đang quá tải. Thử lại?" | Retry button |
| TTS failed | "Không thể tạo giọng đọc. Đổi voice khác?" | Switch to Edge TTS fallback |
| Render failed | "Render thất bại. Log: ..." | Contact support / retry |
| Input quá dài (>5000 từ) | "Bài quá dài, video sẽ >5 phút. Rút gọn?" | Suggest splitting |

---

## 6. Web Interface Design

### 6.1 Technology: Next.js + React + TypeScript + Tailwind CSS

**Lý do chọn Next.js:**
- Cùng hệ sinh thái React với Remotion (share types, components, design tokens)
- SSR cho SEO page (landing page, docs)
- API Routes cho backend lightweight
- Vercel deploy dễ dàng

### 6.2 Page Structure

```
/news2video                     ← Landing page (marketing)
/app                            ← Web app
  /dashboard                    ← Dashboard
  /new                          ← Create new video
  /history                      ← Video history
  /video/:id                    ← Video detail
  /settings                     ← User settings
```

### 6.3 Screen Designs

#### Screen 1: Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  News2Video                                       ⚙️ Settings │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌──────────┐  ┌──────────┐        │
│  │  📹 Videos this week  │  │  ⏱️ Avg    │  │  💰 Cost  │        │
│  │       24              │  │  1.8 min  │  │  ~$0.00   │        │
│  └─────────────────────┘  └──────────┘  └──────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  [+ New Video]                                       │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  Recent Videos                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 📹 Tin tức hôm nay...         ✅ Done   2 min ago  ⬇️ │    │
│  │ 📹 Báo cáo thị trường...      🔄 Rendering  1 min ago│    │
│  │ 📹 Công nghệ AI mới...        ✅ Done   1 hour ago ⬇️│    │
│  │ 📹 Sự kiện tuần này...        ❌ Failed   2 hours ago│    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Screen 2: Create New Video

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard              New Video          ⚙️       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Content ────────────────────────────────────────────┐    │
│  │  [📋 Paste text]  [📁 Upload .md]  [📄 Upload .txt]    │    │
│  │                                                       │    │
│  │  ┌─────────────────────────────────────────────────┐  │    │
│  │  │                                                 │  │    │
│  │  │  # Tin tức hôm nay                               │  │    │
│  │  │                                                 │  │    │
│  │  │  Hôm nay thị trường chứng khoán...               │  │    │
│  │  │  (paste your markdown here)                     │  │    │
│  │  │                                                 │  │    │
│  │  └─────────────────────────────────────────────────┘  │    │
│  │                                                       │    │
│  │  📊 Word count: 342  |  🌐 Language: Vietnamese       │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ Configuration ──────────────────────────────────────┐    │
│  │                                                       │    │
│  │  🎤 Voice:  [▼ Nữ miền Bắc (Hoài My)]  🔊 Preview     │    │
│  │                                                       │    │
│  │  📐 Format:  [✓ 9:16 (TikTok)]  [  16:9 (YouTube)]    │    │
│  │                                                       │    │
│  │  ⏱️ Duration:  [● Auto]  [  30s]  [  60s]  [  90s]    │    │
│  │                                                       │    │
│  │  📑 Slides:   [● Auto]  [  4]  [  5]  [  6]           │    │
│  │                                                       │    │
│  │  🎵 Background music:  [▼ None]  [▼ News theme 1]     │    │
│  │                                                       │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                [⚡ Generate Video]                     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Screen 3: Progress (after clicking Generate)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                          Generating...               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │              📹 Generating your video                  │    │
│  │                                                       │    │
│  │  ████████████████░░░░░░░░░░  65%                      │    │
│  │                                                       │    │
│  │  ✅ Parsing content                          (0.2s)  │    │
│  │  ✅ Generating slide script (Ollama)         (8.5s)  │    │
│  │  ✅ Creating voiceover (Edge TTS)            (12.3s) │    │
│  │  🔄 Rendering video (Remotion)...            (est. 45s)│   │
│  │  ⏳ Converting to 16:9...                    (pending)│   │
│  │                                                       │    │
│  │  Estimated time remaining: ~50 seconds                │    │
│  │                                                       │    │
│  │  [Cancel]                                             │    │
│  │                                                       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Screen 4: Video Complete + Preview

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                              ✅ Video Ready          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐    │
│  │                      │  │                             │    │
│  │                      │  │  Title: Tin tức hôm nay      │    │
│  │    ▶ Video Preview   │  │  Slides: 5                  │    │
│  │      9:16            │  │  Duration: 1m 24s           │    │
│  │                      │  │  Size: 12.4 MB              │    │
│  │                      │  │  Created: 2 min ago          │    │
│  │                      │  │                             │    │
│  └──────────────────────┘  │  [⬇ Download 9:16 (MP4)]    │    │
│                            │  [⬇ Download 16:9 (MP4)]    │    │
│  ┌──────────────────────┐  │                             │    │
│  │    ▶ Video Preview   │  │  [🔄 Re-generate]           │    │
│  │      16:9            │  │                             │    │
│  │                      │  └────────────────────────────┘    │
│  └──────────────────────┘                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Screen 5: History

```
┌──────────────────────────────────────────────────────────────┐
│  ← Dashboard                        History           ⚙️      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Filters:  [All Status ▼]  [All Lang ▼]  [Last 7 days ▼]    │
│  Search:   [🔍 Search by title...]                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Status │ Title                 │ Date      │ Duration │    │
│  │────────│───────────────────────│───────────│──────────│    │
│  │ ✅     │ Tin tức hôm nay        │ 2 min ago │ 1m 24s  ⬇️│   │
│  │ 🔄    │ Báo cáo thị trường     │ 1 min ago │ —        │    │
│  │ ✅     │ Công nghệ AI mới       │ 1 hr ago  │ 0m 52s  ⬇️│   │
│  │ ❌    │ Sự kiện tuần này        │ 2 hr ago  │ —       🔄│   │
│  │ ✅     │ Kinh tế vĩ mô Q2       │ 3 hr ago  │ 1m 45s  ⬇️│   │
│  │ ✅     │ Startup Việt 2026      │ 1 day ago │ 1m 12s  ⬇️│   │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Page: [< 1] [2] [3] ... [12 >]                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Technical Architecture

### 7.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SYSTEM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────┘

  [User Browser]                  [Ollama Cloud]
       │                               │
       │ HTTPS                         │ HTTP/gRPC
       ▼                               ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Next.js   │───▶│ FastAPI   │───▶│ Temporal  │
  │ Frontend  │    │ Backend   │    │ Workers   │
  │ (React)   │    │ (Python)  │    │ (Python)  │
  └──────────┘    └──────────┘    └──────────┘
       │               │                │
       │               ▼                ▼
       │         ┌──────────┐    ┌──────────────┐
       │         │ Postgres  │    │ Remotion CLI  │
       │         │ (Jobs DB) │    │ (Node.js)    │
       │         └──────────┘    │ FFmpeg        │
       │                         │ WhisperX      │
       │                         └──────────────┘
       │                               │
       ▼                               ▼
  ┌──────────────────────────────────────────┐
  │           Storage (MinIO / S3)            │
  │   TTS audio, rendered MP4, temp files     │
  └──────────────────────────────────────────┘
```

### 7.2 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React 18 + TypeScript | Web app UI |
| **Styling** | Tailwind CSS + shadcn/ui | Component library |
| **State** | React Query (TanStack Query) | Server state, polling |
| **Backend API** | FastAPI (Python 3.11+) | Job management, pipeline orchestration |
| **Queue** | Temporal.io (Python SDK) | Durable execution for long-running video jobs |
| **Database** | PostgreSQL 15 | Job history, user settings, analytics |
| **Cache** | Redis | Progress tracking, rate limiting |
| **LLM** | Ollama Cloud (Qwen 3 32B) | Slide script generation |
| **TTS** | Edge TTS (Microsoft) | Voiceover generation |
| **Alignment** | WhisperX | Word-level timestamps |
| **Video Render** | Remotion (React) | Slide composition, animation, MP4 export |
| **Media Processing** | FFmpeg | Aspect ratio conversion, audio mixing |
| **Storage** | MinIO (local S3-compatible) | Video files, audio, temp artifacts |
| **Deployment** | Docker Compose / Vercel | Development & production |

### 7.3 Project Structure

```
news2video/
├── frontend/                       # Next.js web app
│   ├── src/
│   │   ├── app/                    # App Router
│   │   │   ├── dashboard/          # Dashboard page
│   │   │   ├── new/                # Create new video
│   │   │   ├── history/            # Video history
│   │   │   ├── video/[id]/         # Video detail
│   │   │   └── settings/           # Settings page
│   │   ├── components/             # Shared UI components
│   │   │   ├── ui/                 # shadcn/ui primitives
│   │   │   ├── VideoPreview.tsx    # HTML5 video player
│   │   │   ├── ProgressTracker.tsx # Real-time progress
│   │   │   ├── ContentEditor.tsx   # Markdown editor
│   │   │   └── ConfigPanel.tsx     # Voice/format selector
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useGenerateVideo.ts # Generate mutation
│   │   │   ├── useJobPolling.ts    # Poll job status
│   │   │   └── useVideoHistory.ts  # History query
│   │   ├── lib/                    # Utilities
│   │   │   ├── api.ts              # API client
│   │   │   └── types.ts            # Shared types
│   │   └── styles/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/                        # FastAPI backend
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── api/
│   │   │   ├── jobs.py             # POST /jobs, GET /jobs/:id
│   │   │   ├── videos.py           # GET /videos, GET /videos/:id
│   │   │   └── health.py           # Health check
│   │   ├── models/
│   │   │   ├── job.py              # SQLAlchemy Job model
│   │   │   └── schemas.py          # Pydantic schemas
│   │   ├── services/
│   │   │   ├── job_service.py      # Job CRUD
│   │   │   ├── pipeline.py         # Orchestration (Temporal client)
│   │   │   └── storage.py          # MinIO/S3 file management
│   │   ├── temporal/               # Temporal workers & workflows
│   │   │   ├── workflows.py        # NewsToVideoWorkflow
│   │   │   ├── activities.py       # Parse, LLM, TTS, Render activities
│   │   │   └── worker.py           # Temporal worker entrypoint
│   │   └── config.py               # Settings (env, secrets)
│   ├── requirements.txt
│   └── alembic/                    # DB migrations
│
├── remotion/                       # Remotion video project
│   ├── src/
│   │   ├── Root.tsx               # Remotion entry
│   │   ├── compositions/
│   │   │   └── NewsVideo.tsx      # TransitionSeries
│   │   ├── components/
│   │   │   ├── NewsSlide.tsx      # 1 slide component
│   │   │   ├── LowerThird.tsx     # Karaoke subtitle
│   │   │   └── Transition.tsx     # Custom transitions
│   │   └── design-tokens.ts       # Color, font tokens
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                         # Shared types between FE & BE
│   ├── types.ts                    # Job, Video, Slide schemas
│   └── constants.ts                # Voices, formats, configs
│
├── docker-compose.yml              # Full stack orchestration
├── Makefile                        # Dev commands
├── README.md
└── PRD.md                          # This document
```

---

## 8. API Design

### 8.1 REST API Endpoints

#### Jobs

```
POST   /api/v1/jobs                  Create new video generation job
GET    /api/v1/jobs                  List all jobs (paginated)
GET    /api/v1/jobs/:id              Get job status + progress
DELETE /api/v1/jobs/:id              Cancel running job
```

#### Videos

```
GET    /api/v1/videos                List completed videos (paginated)
GET    /api/v1/videos/:id            Get video detail + download URLs
GET    /api/v1/videos/:id/download   Download MP4 (with format query)
```

#### Health

```
GET    /api/v1/health                Health check
GET    /api/v1/health/ollama         Ollama Cloud connectivity check
```

### 8.2 API Contracts

#### POST /api/v1/jobs — Create Job

```json
// Request
{
  "content": "# Tin tức hôm nay\n\nHôm nay thị trường chứng khoán...",
  "config": {
    "voice": "vi-VN-HoaiMyNeural",
    "format": "9x16",
    "outputs": ["9x16", "16x9"],
    "target_duration_sec": 60,
    "slide_count": 5,
    "background_music": null
  }
}

// Response 202 Accepted
{
  "job_id": "job_abc123",
  "status": "queued",
  "created_at": "2026-06-02T10:30:00Z",
  "estimated_duration_sec": 120
}
```

#### GET /api/v1/jobs/:id — Job Status

```json
// Response 200 (in progress)
{
  "job_id": "job_abc123",
  "status": "processing",
  "progress": {
    "current_step": "rendering",
    "percent": 65,
    "steps": [
      {"name": "parsing", "status": "completed", "duration_ms": 200},
      {"name": "scripting", "status": "completed", "duration_ms": 8500},
      {"name": "tts", "status": "completed", "duration_ms": 12300},
      {"name": "rendering", "status": "in_progress", "duration_ms": null}
    ],
    "estimated_remaining_sec": 50
  },
  "created_at": "2026-06-02T10:30:00Z",
  "updated_at": "2026-06-02T10:31:45Z"
}
```

```json
// Response 200 (completed)
{
  "job_id": "job_abc123",
  "status": "completed",
  "progress": {
    "current_step": "completed",
    "percent": 100,
    "steps": [
      {"name": "parsing", "status": "completed", "duration_ms": 200},
      {"name": "scripting", "status": "completed", "duration_ms": 8500},
      {"name": "tts", "status": "completed", "duration_ms": 12300},
      {"name": "rendering", "status": "completed", "duration_ms": 52000},
      {"name": "converting", "status": "completed", "duration_ms": 15000}
    ]
  },
  "video": {
    "video_id": "vid_xyz789",
    "title": "Tin tức hôm nay",
    "duration_sec": 84,
    "slide_count": 5,
    "downloads": {
      "9x16": {
        "url": "https://storage.news2video.dev/videos/vid_xyz789_9x16.mp4",
        "size_bytes": 12400000,
        "expires_at": "2026-06-03T10:30:00Z"
      },
      "16x9": {
        "url": "https://storage.news2video.dev/videos/vid_xyz789_16x9.mp4",
        "size_bytes": 12800000,
        "expires_at": "2026-06-03T10:30:00Z"
      }
    }
  },
  "created_at": "2026-06-02T10:30:00Z",
  "completed_at": "2026-06-02T10:32:28Z"
}
```

#### GET /api/v1/videos — Video History

```json
// Response 200
{
  "videos": [
    {
      "video_id": "vid_xyz789",
      "title": "Tin tức hôm nay",
      "status": "completed",
      "duration_sec": 84,
      "slide_count": 5,
      "format": "9x16",
      "language": "vi",
      "thumbnail_url": "https://storage.../vid_xyz789_thumb.jpg",
      "created_at": "2026-06-02T10:32:28Z",
      "download_9x16": "https://storage.../vid_xyz789_9x16.mp4",
      "download_16x9": "https://storage.../vid_xyz789_16x9.mp4"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

### 8.3 WebSocket — Real-time Progress

```
WS /api/v1/ws/jobs/:id

→ Server pushes progress updates mỗi giây:
{
  "type": "progress",
  "job_id": "job_abc123",
  "current_step": "rendering",
  "percent": 65,
  "steps": [...]
}

→ Khi job hoàn thành:
{
  "type": "completed",
  "job_id": "job_abc123",
  "video": {...}
}

→ Khi job thất bại:
{
  "type": "failed",
  "job_id": "job_abc123",
  "error": "Ollama Cloud timeout after 30s",
  "retryable": true
}
```

---

## 9. Database Schema

### 9.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│    jobs      │       │   videos     │
├──────────────┤       ├──────────────┤
│ id (PK)      │──1:1──│ id (PK)      │
│ status       │       │ job_id (FK)  │
│ content_hash │       │ title        │
│ config (JSON)│       │ duration_sec │
│ progress(JSON)│      │ slide_count  │
│ error_msg    │       │ language     │
│ workflow_id  │       │ format       │
│ created_at   │       │ file_9x16    │
│ updated_at   │       │ file_size_9x16│
│ completed_at │       │ file_16x9    │
└──────────────┘       │ file_size_16x9│
                       │ thumbnail_url│
                       │ created_at   │
                       └──────────────┘
```

### 9.2 SQL Schema

```sql
-- Jobs table
CREATE TABLE jobs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status        VARCHAR(20) NOT NULL DEFAULT 'queued',
    -- queued | processing | completed | failed | cancelled
    
    -- Input
    content_text  TEXT NOT NULL,
    content_hash  VARCHAR(64) NOT NULL,  -- SHA-256 for caching
    word_count    INTEGER NOT NULL,
    detected_lang VARCHAR(10),           -- vi, en, auto
    
    -- Config
    config_json   JSONB NOT NULL DEFAULT '{}',
    -- { voice, format, outputs, target_duration_sec, slide_count, bg_music }
    
    -- Progress
    progress_json JSONB DEFAULT '{}',
    -- { current_step, percent, steps: [{name, status, duration_ms}] }
    
    -- Temporal
    workflow_id   VARCHAR(255),
    error_message TEXT,
    retry_count   INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    
    -- Indexes
    CONSTRAINT valid_status CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_content_hash ON jobs(content_hash);

-- Videos table
CREATE TABLE videos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Metadata
    title           VARCHAR(500) NOT NULL,
    duration_sec    FLOAT NOT NULL,
    slide_count     INTEGER NOT NULL,
    language        VARCHAR(10) NOT NULL,       -- vi, en
    format          VARCHAR(10) NOT NULL,        -- 9x16, 16x9
    
    -- Files
    file_9x16_url   TEXT,
    file_9x16_size  BIGINT,                     -- bytes
    file_16x9_url   TEXT,
    file_16x9_size  BIGINT,
    thumbnail_url   TEXT,
    
    -- Slide detail
    slides_json     JSONB,                      -- Full slide data for preview
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_job UNIQUE (job_id)
);

CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_language ON videos(language);
```

---

## 10. Video Pipeline Detail

### 10.1 Pipeline Steps (Temporal Workflow)

```
                    ┌──────────────┐
  User clicks       │   FastAPI    │
  "Generate" ──────▶│  POST /jobs  │
                    └──────┬───────┘
                           │ Start Temporal Workflow
                           ▼
              ┌─────────────────────────┐
              │  NewsToVideoWorkflow     │
              └─────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                 ▼
    ┌──────────┐    ┌──────────┐     ┌──────────┐
    │ Activity │    │ Activity │     │ Activity │
    │ Parse    │    │ LLM      │     │ TTS      │
    │ (1-5s)   │    │ (5-20s)  │     │ (5-20s)  │
    └──────────┘    └──────────┘     └──────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           ▼
                    ┌──────────┐
                    │ Activity │
                    │ WhisperX │
                    │ (5-15s)  │
                    └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │ Activity │
                    │ Render   │
                    │ (30-90s) │
                    └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │ Activity │
                    │ Convert  │
                    │ (10-30s) │
                    └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │  Done!   │
                    └──────────┘
```

### 10.2 Activity Specifications

| Activity | Input | Output | Timeout | Retry |
|----------|-------|--------|---------|-------|
| **parse_content** | Markdown text | `{title, paragraphs[], headings[], word_count}` | 10s | 3x |
| **generate_script** | Parsed content + config | `{slides: [{title, bullets, voiceover, duration}]}` | 30s | 2x |
| **generate_tts** | Voiceover text + voice ID | `{audio_path, duration_ms}` | 30s | 3x |
| **align_words** | Audio path + text | `{word_segments: [{word, start, end}]}` | 30s | 2x |
| **render_video** | Slides data + audio paths + props | `{output_9x16_path}` | 120s | 2x |
| **convert_format** | 9x16 path | `{output_16x9_path}` | 60s | 2x |
| **upload_storage** | Output paths | `{download_urls}` | 60s | 3x |

### 10.3 Caching Strategy

| Asset | Cache Key | Storage | TTL |
|-------|-----------|---------|-----|
| Slide script | `script:{content_hash}:{config_hash}` | Postgres JSONB | ∞ |
| TTS audio | `tts:{voiceover_hash}:{voice_id}` | MinIO | 30 days |
| Rendered 9x16 | `render:{content_hash}:{config_hash}` | MinIO | 90 days |
| Rendered 16x9 | `render:{content_hash}:{config_hash}:16x9` | MinIO | 90 days |

> Nếu user generate cùng content với cùng config → trả kết quả cache ngay (không re-run pipeline).

---

## 11. Development Milestones

### Milestone 1: Foundation (Week 1–2)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Setup monorepo structure | BE | 2h | Project skeleton |
| Docker Compose local dev | BE | 4h | `docker-compose up` chạy được |
| FastAPI skeleton + health endpoint | BE | 4h | `GET /api/v1/health` |
| PostgreSQL schema + migrations | BE | 4h | Alembic migration |
| Remotion project setup | FE | 4h | Render 1 slide tĩnh |
| Next.js project + Tailwind + shadcn/ui | FE | 4h | Empty app với design system |
| Shared types package | Full | 2h | TypeScript types cho Job, Video, Slide |

**Milestone check:** `docker-compose up` → FastAPI health OK → Remotion render OK

### Milestone 2: Core Pipeline (Week 2–4)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Content parser (mistune) | BE | 4h | `parse_content` activity |
| Ollama Cloud integration | BE | 8h | `generate_script` activity |
| Edge TTS integration | BE | 4h | `generate_tts` activity |
| WhisperX integration | BE | 8h | `align_words` activity |
| Remotion composition (NewsSlide + LowerThird + TransitionSeries) | FE | 16h | Render multi-slide video |
| Remotion CLI wrapper | BE | 4h | `render_video` activity |
| FFmpeg format conversion | BE | 2h | `convert_format` activity |
| Temporal workflow assembly | BE | 8h | `NewsToVideoWorkflow` end-to-end |

**Milestone check:** Run pipeline from `content_parser.py` → output MP4 chạy được

### Milestone 3: Web UI (Week 4–6)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| API endpoints (jobs, videos) | BE | 8h | Full REST API |
| WebSocket progress | BE | 4h | Real-time progress push |
| Dashboard page | FE | 8h | Stats + recent videos |
| "New Video" page | FE | 12h | Content editor + config panel |
| Progress tracker component | FE | 8h | Step-by-step progress bar |
| Video preview + download | FE | 6h | HTML5 player + download buttons |
| History page | FE | 8h | Paginated table + filters |
| Settings page | FE | 4h | Default config persistence |

**Milestone check:** User flow: Paste text → Config → Generate → Download (full happy path)

### Milestone 4: Polish & Ship (Week 6–8)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Error handling + retry UI | Full | 8h | Graceful error states |
| Thumbnail generation | BE | 4h | Auto-thumbnail frame capture |
| Background music library | FE | 4h | 3–5 royalty-free tracks |
| Voice preview samples | FE | 2h | 🔊 Play voice sample |
| Content hash caching | BE | 4h | Skip re-generation |
| Load testing (100 concurrent jobs) | BE | 8h | Performance baseline |
| Deployment docs | Full | 4h | README + deploy guide |
| Landing page (marketing) | FE | 8h | `news2video.dev` static site |

**Milestone check:** Production deploy, 100 jobs stress test pass

---

## 12. Success Metrics

### 12.1 Product Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|------------|
| **Time to first video** | < 5 minutes | Time from landing page → first download |
| **Generate latency (60s video)** | < 3 minutes | P50 job completion time |
| **Generate success rate** | > 95% | Completed / (Completed + Failed) |
| **Video quality (user rating)** | > 4.0 / 5 | In-app feedback after download |
| **Daily Active Users (DAU)** | 10+ | Analytics (Week 4+) |
| **Videos generated / day** | 50+ | DB query |
| **Return rate** | > 60% | Users returning within 7 days |

### 12.2 Technical Metrics

| Metric | Target |
|--------|--------|
| API response time (p50) | < 200ms |
| WebSocket message latency | < 500ms |
| Worker throughput | 5 concurrent jobs/worker |
| Cache hit rate | > 40% |
| Error rate | < 5% |
| DB query time (p95) | < 100ms |

---

## 13. Appendix

### A. Voice Reference Table

| Voice ID | Language | Gender | Accent | Provider |
|----------|----------|--------|--------|----------|
| `vi-VN-HoaiMyNeural` | 🇻🇳 Vietnamese | Female | Northern | Edge TTS |
| `vi-VN-NamMinhNeural` | 🇻🇳 Vietnamese | Male | Northern | Edge TTS |
| `en-US-JennyNeural` | 🇺🇸 English | Female | US | Edge TTS |
| `en-US-GuyNeural` | 🇺🇸 English | Male | US | Edge TTS |
| `en-GB-SoniaNeural` | 🇬🇧 English | Female | UK | Edge TTS |
| `en-GB-RyanNeural` | 🇬🇧 English | Male | UK | Edge TTS |

### B. Environment Variables

```bash
# .env
# ── Ollama Cloud ──
OLLAMA_API_URL=https://your-ollama-cloud.com/api/generate
OLLAMA_MODEL=qwen3:32b

# ── Temporal ──
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=news2video

# ── Database ──
DATABASE_URL=postgresql://news2video:news2video@localhost:5432/news2video

# ── Storage (MinIO) ──
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=news2video

# ── Redis ──
REDIS_URL=redis://localhost:6379/0

# ── App ──
SECRET_KEY=change-me-in-production
ENVIRONMENT=development
LOG_LEVEL=debug
```

### C. Design Token Reference

```css
:root {
  /* Colors */
  --bg-primary: #0D1117;
  --bg-secondary: #161B22;
  --bg-tertiary: #21262D;
  --text-primary: #FFFFFF;
  --text-secondary: #E5E7EB;
  --text-muted: #8B949E;
  --accent-red: #FF6B6B;
  --accent-yellow: #FFD93D;
  --accent-teal: #4ECDC4;
  --accent-blue: #58A6FF;
  --border: #30363D;

  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-display: 'Montserrat', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Video Typography (Remotion) */
  --video-title-size: 130px;
  --video-bullet-size: 52px;
  --video-subtitle-size: 42px;
  --video-stroke-width: 8px;

  /* Spacing */
  --safe-top: 220px;
  --safe-bottom: 480px;
  --safe-horizontal: 90px;

  /* Animation */
  --transition-fast: 0.2s;
  --transition-normal: 0.4s;
  --transition-slow: 0.6s;
}
```

### D. Glossary

| Term | Definition |
|------|-----------|
| **Job** | Một lần generate video (có thể pending, processing, completed, failed) |
| **Video** | Sản phẩm đầu ra (MP4 file) — 1 job tạo ra 1 video với 2 format |
| **Slide** | 1 "trang" trong video — gồm title, bullets, voiceover, duration |
| **Transition** | Hiệu ứng chuyển cảnh giữa 2 slides (fade, slide, wipe...) |
| **Karaoke Subtitle** | Phụ đề highlight từng từ theo tiến độ đọc |
| **Lower Third** | Vùng phụ đề ở 1/3 dưới màn hình |
| **Temporal** | Orchestration engine cho long-running workflows |
| **Activity** | 1 step trong Temporal workflow (parse, tts, render...) |

---

## Next Steps

1. ✅ PRD approved → Start Milestone 1
2. Setup `docker-compose.yml` with all services
3. Create GitHub repo with monorepo structure
4. Implement FastAPI health endpoint
5. Render first Remotion slide component

---

**Document Status:** Approved for MVP Development  
**Next Review:** After Milestone 1 completion (Week 2)
