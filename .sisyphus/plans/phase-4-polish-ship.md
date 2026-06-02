# Phase 4 — Polish & Ship

> **Mục tiêu:** Tối ưu performance, testing, deployment, landing page marketing
> **Điều kiện tiên quyết:** Phase 1-3 hoàn thành (tất cả tính năng MVP hoạt động)
> **Effort ước tính:** 12-16 giờ
> **Tiêu chí hoàn thành:** Deploy được lên production, load test pass, landing page live

---

## 1. Performance Optimization

### 1.1 Frontend optimization

- **Image optimization:** Dùng Next.js `<Image>` cho thumbnails
- **Code splitting:** Dynamic import cho page ít truy cập (Settings, Landing)
- **Bundle analysis:** Chạy `@next/bundle-analyzer`, tối ưu chunks lớn
- **Font optimization:** Dùng `next/font` cho Inter, Montserrat
- **Lighthouse target:** Performance > 90, Accessibility > 95

### 1.2 Backend optimization

- **DB connection pooling:** Cấu hình pool_size trong async engine
- **Redis caching:** Cache job status (TTL 60s) để giảm DB query
- **MinIO presigned URLs:** Thay vì stream qua FastAPI
- **Temporal worker pool:** Cấu hình max_concurrent_activities = 5
- **API response time target:** p50 < 200ms

### 1.3 Caching strategy — full

| Asset | Cache Key | Storage | TTL |
|-------|-----------|---------|-----|
| Slide script | `script:{content_hash}:{config_hash}` | Postgres JSONB | ∞ |
| TTS audio | `tts:{voiceover_hash}:{voice_id}` | MinIO | 30 days |
| Word alignments | `align:{audio_hash}` | Postgres JSONB | 30 days |
| Rendered 9:16 | `render:{content_hash}:{config_hash}` | MinIO | 90 days |
| Rendered 16:9 | `render:{content_hash}:{config_hash}:16x9` | MinIO | 90 days |
| Thumbnails | `thumb:{video_id}` | MinIO | 90 days |

---

## 2. Testing

### 2.1 Backend unit tests

**Files cần thêm/sửa:**

| Test file | Test gì |
|-----------|---------|
| `tests/test_parse_content.py` | ✅ Đã có — verify edge cases |
| `tests/test_generate_tts.py` | ✅ Đã có — verify |
| `tests/test_job_service.py` | **Mới** — create, get, list, cache logic |
| `tests/test_video_service.py` | **Mới** — create, get, list |
| `tests/test_schemas.py` | **Mới** — validation: content < 10 chars, invalid voice |
| `tests/test_api_jobs.py` | **Mới** — HTTP tests với TestClient |
| `tests/test_api_videos.py` | **Mới** — HTTP tests |
| `tests/test_workflow.py` | **Mới** — Temporal workflow test với test environment |

### 2.2 Integration test — End-to-end

**File mới:** `backend/tests/test_e2e_pipeline.py`

```
Yêu cầu:
- Test full pipeline với sample_article.md
- Verify: input → parse → script (mock Ollama) → TTS → render → output MP4 tồn tại
- Không mock WhisperX (nếu có GPU) hoặc mock
- Timeout: 5 phút
```

### 2.3 Load testing

**File cần sửa:** `backend/tests/load_test.py`

```
Yêu cầu:
- 100 concurrent jobs
- Đo: p50/p95/p99 latency
- Đo: success rate, error rate
- Đo: worker throughput (jobs/minute)
- Target: > 95% success rate, p50 < 3 phút/video
```

### 2.4 Frontend tests (optional, nice-to-have)

- Component test cho ProgressTracker, VideoPlayer
- E2E test với Playwright: flow Paste → Generate → Download

---

## 3. Landing Page Hoàn Chỉnh

### 3.1 Thiết kế landing page marketing

**File cần sửa:** `frontend/src/app/landing/page.tsx`

**Sections:**

#### Hero
```
┌──────────────────────────────────────────────┐
│                                              │
│  Text to Video, Tự Động                      │
│  Chuyển bài viết thành video tin tức          │
│  chuyên nghiệp trong vài phút                 │
│                                              │
│  [Dùng thử miễn phí]  [Xem demo]             │
│                                              │
└──────────────────────────────────────────────┘
```

#### How It Works (3 steps)
```
┌──────────────────────────────────────────────┐
│  1. Dán nội dung   2. Chọn giọng   3. Tải về │
│  Paste bài viết     Chọn voice AI    Nhận MP4│
│  hoặc upload file   + format        ngay lập │
│                     + số slides      tức      │
└──────────────────────────────────────────────┘
```

#### Features Grid
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🤖 AI Script │ │ 🎤 Giọng đọc│ │ 🎬 Video    │
│ Tự động tóm  │ │ Việt + Anh  │ │ Chuyên nghiệp│
│ tắt & chia   │ │ Edge TTS    │ │ Dark theme   │
│ slide        │ │ miễn phí    │ │ Karaoke sub  │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 📱 Đa định  │ │ ⚡ Nhanh     │ │ 💰 Miễn phí  │
│ dạng        │ │ 2-3 phút    │ │ ~$0/video   │
│ 9:16 + 16:9 │ │ /video      │ │              │
└─────────────┘ └─────────────┘ └─────────────┘
```

#### Pricing (nếu có monetization plan)
- Free tier: 10 videos/tháng
- Pro tier: không giới hạn (tương lai)

#### FAQ
- Có hỗ trợ tiếng Anh không? → Có
- Video dài tối đa bao lâu? → 2 phút
- Có cần cài đặt gì không? → Không, chạy trên trình duyệt

#### Footer
- Link: GitHub, Contact, Privacy, Terms
- Copyright 2026

### 3.2 SEO optimization

- Meta tags: title, description, og:image
- Structured data: WebApplication schema
- Sitemap generation
- `robots.txt`

---

## 4. Landing Page — Technical

### 4.1 Sửa route

Landing page là `/` (root), app chuyển sang `/app`:
- `/` → Landing page (marketing)
- `/app` → Dashboard
- `/app/new` → New Video
- `/app/history` → History
- `/app/video/:id` → Video Detail
- `/app/settings` → Settings

**Hoặc giữ nguyên structure hiện tại**, với `/landing` là landing page và `/` là dashboard. Quyết định tùy theo deployment plan.

### 4.2 Demo video (optional)

- Render sẵn 1 video mẫu bằng chính pipeline
- Embed YouTube/Vimeo hoặc tự host
- Hiển thị trong landing page

---

## 5. Deployment

### 5.1 Docker production setup

**File mới:** `docker-compose.prod.yml`

```
Khác với dev:
- Postgres: volume persistent, password từ env secret
- Redis: password protected
- MinIO: persistent volume, SSL
- Temporal: production config
- Frontend: build Static HTML → serve qua Nginx hoặc Vercel
- Backend: Docker image với gunicorn + uvicorn workers
```

### 5.2 Backend Dockerfile

**File mới:** `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.3 Frontend deployment (Vercel)

**File mới:** `frontend/vercel.json` (nếu dùng Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.news2video.dev"
  }
}
```

### 5.4 Environment-specific config

| Biến | Development | Production |
|------|------------|------------|
| `ENVIRONMENT` | development | production |
| `LOG_LEVEL` | debug | info |
| `CORS_ORIGINS` | localhost:3000 | news2video.dev |
| `OLLAMA_API_URL` | local ollama | production ollama cloud |
| `SECRET_KEY` | dev-secret | `${SECRET_KEY}` (env secret) |
| `DATABASE_URL` | localhost | `${DATABASE_URL}` |

### 5.5 Health check endpoint

**File cần sửa:** `backend/app/api/health.py`

Thêm:
- `GET /api/v1/health/db` — check DB connection
- `GET /api/v1/health/redis` — check Redis connection
- `GET /api/v1/health/minio` — check MinIO connection
- `GET /api/v1/health/ollama` — check Ollama Cloud connection
- `GET /api/v1/health/temporal` — check Temporal connection

---

## 6. Monitoring & Logging

### 6.1 Structured logging

**File cần sửa:** `backend/app/main.py`

- Dùng `structlog` hoặc Python `logging` với JSON format
- Log level: DEBUG (dev), INFO (prod)
- Log mỗi request: method, path, status, duration
- Log mỗi activity: input hash, duration, status

### 6.2 Error tracking (Sentry — optional)

- `pip install sentry-sdk`
- Init trong `main.py`: `sentry_sdk.init(dsn=...)`
- Chỉ enable trong production

### 6.3 Temporal monitoring

- Temporal UI: http://localhost:8080 (đã có)
- Monitoring: workflow success rate, activity latency, queue depth

---

## 7. Documentation

### 7.1 Cập nhật README.md

**Thêm:**
- Architecture diagram (ASCII hoặc link ảnh)
- API docs link
- Deployment guide (Vercel + Docker)
- Troubleshooting section
- Contributing guide

### 7.2 API documentation

- FastAPI auto-generated docs tại `/api/docs` (đã có)
- Thêm description, examples cho mỗi endpoint
- Thêm error response schemas

### 7.3 CHANGELOG.md

**File mới:** `CHANGELOG.md`

```
## [0.1.0] - 2026-06-XX
### Added
- Initial MVP release
- Text-to-video pipeline with Temporal
- Edge TTS voiceover
- Remotion video rendering
- Web dashboard with progress tracking
```

---

## 8. Launch Checklist

### Pre-launch

- [ ] Tất cả test pass (unit + integration + load)
- [ ] Lighthouse score > 90
- [ ] Security scan: không có secret trong code
- [ ] `.env` không commit (check `.gitignore`)
- [ ] Environment variables set trên production
- [ ] Database migration chạy thành công trên production
- [ ] MinIO bucket created + policy set
- [ ] Temporal namespace registered
- [ ] DNS configured: app.news2video.dev, api.news2video.dev
- [ ] SSL certificates (Let's Encrypt hoặc Vercel auto)

### Launch

- [ ] Deploy backend (Docker)
- [ ] Deploy frontend (Vercel)
- [ ] Start Temporal workers
- [ ] Run health check trên tất cả services
- [ ] Test happy path trên production
- [ ] Monitor logs trong 1 giờ đầu

### Post-launch (Week 1)

- [ ] Monitor error rate < 5%
- [ ] Monitor generate latency < 3 phút
- [ ] Fix critical bugs trong 24h
- [ ] Thu thập user feedback

---

## Success Metrics Target (PRD §12)

| Metric | Target | Đo lường |
|--------|--------|----------|
| Time to first video | < 5 phút | Analytics |
| Generate latency (60s video) | < 3 phút | P50 job completion |
| Generate success rate | > 95% | Completed / Total |
| API response time (p50) | < 200ms | FastAPI middleware |
| Worker throughput | 5 concurrent jobs/worker | Temporal metrics |
| Cache hit rate | > 40% | DB query |
| Error rate | < 5% | Sentry/logs |

---

## Verification Checklist (Phase 4 Done)

- [ ] Lighthouse score > 90 trên tất cả page
- [ ] Unit tests coverage > 70%
- [ ] Load test: 100 jobs concurrent, > 95% success
- [ ] Landing page hoàn chỉnh với đủ sections
- [ ] Docker production setup sẵn sàng
- [ ] Health check endpoints hoạt động
- [ ] README + CHANGELOG cập nhật
- [ ] Deploy thành công lên production
- [ ] Happy path test trên production PASS
