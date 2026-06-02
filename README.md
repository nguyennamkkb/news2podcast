# News2Video

> Convert articles to professional news videos with AI voiceover, karaoke subtitles, and smooth slide transitions.

## Features

- **Text/Markdown Input** — Paste or upload .md / .txt files
- **AI Script Generation** — Ollama Cloud LLM (Qwen 3 32B) summarizes and structures content into slides
- **Natural Voiceover** — Free Microsoft Edge TTS with Vietnamese and English voices
- **Professional Video** — Dark theme, animated slides, fade transitions, karaoke subtitle sync
- **Dual Format** — 9:16 (TikTok/Shorts) + 16:9 (YouTube)
- **~$0 Cost** — Ollama Cloud (free) + Edge TTS (free) + Remotion self-host

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI (Python), Temporal.io, PostgreSQL, Redis |
| **Video Render** | Remotion (React), FFmpeg |
| **LLM** | Ollama Cloud (Qwen 3 32B) |
| **TTS** | Microsoft Edge TTS (free) |
| **Alignment** | WhisperX |
| **Storage** | MinIO (S3-compatible) |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- FFmpeg

### Setup

```bash
# 1. Clone
git clone https://github.com/nguyennamkkb/news2podcast.git
cd news2podcast

# 2. Start services
docker compose up -d

# 3. Install dependencies
make install

# 4. Run database migrations
make db-migrate

# 5. Configure Ollama Cloud
cp .env.example .env
# Edit .env and set OLLAMA_API_URL to your Ollama Cloud endpoint

# 6. Start development servers
make dev
```

### Access

| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API Docs | http://localhost:8000/api/docs |
| Temporal UI | http://localhost:8080 |
| MinIO Console | http://localhost:9001 |

## Project Structure

```
news2video/
├── frontend/          # Next.js web app (Dashboard, New Video, History)
├── backend/           # FastAPI + Temporal activities (parse, LLM, TTS, render)
├── remotion/          # Remotion React (NewsSlide, TransitionSeries)
├── shared/            # TypeScript types + constants
├── docker-compose.yml # Postgres, Redis, MinIO, Temporal
└── docs/plans/        # PRD + implementation plan
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/jobs` | Create video generation job |
| `GET` | `/api/v1/jobs/:id` | Get job status + progress |
| `GET` | `/api/v1/videos` | List completed videos |
| `WS` | `/api/v1/ws/jobs/:id` | Real-time progress WebSocket |
| `GET` | `/api/v1/health` | Health check |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_API_URL` | `https://your-ollama-cloud.com/api/generate` | Ollama Cloud endpoint |
| `OLLAMA_MODEL` | `qwen3:32b` | LLM model name |
| `DATABASE_URL` | `postgresql://news2video:news2video@localhost:5432/news2video` | PostgreSQL DSN |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis URL |
| `TEMPORAL_HOST` | `localhost:7233` | Temporal server |

## License

MIT