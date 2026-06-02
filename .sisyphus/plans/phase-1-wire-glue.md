# Phase 1 — Wire the Glue Layer

> **Mục tiêu:** Nối API → Database → Temporal → WebSocket để happy path chạy được end-to-end
> **Effort ước tính:** 8-10 giờ
> **Trạng thái hiện tại:** Pipeline activities chạy độc lập, nhưng API routes chưa nối vào DB và Temporal
> **Tiêu chí hoàn thành:** Paste text → Bấm Generate → WebSocket push progress → Video render → Download được MP4

---

## 1. Wire DB Session vào FastAPI

### 1.1 Tạo async database session manager

**File mới:** `backend/app/database.py`

```
Yêu cầu:
- Dùng SQLAlchemy async engine
- Tạo get_db() async generator để dependency injection
- Tạo create_all() để init schema khi startup
```

**Chi tiết:**
- `engine = create_async_engine(settings.database_url)`
- `async_session = async_sessionmaker(engine, expire_on_commit=False)`
- `async def get_db() -> AsyncGenerator[AsyncSession, None]` — yield session, auto close
- `async def init_db()` — gọi `Base.metadata.create_all` bind=engine

### 1.2 Sửa POST /api/v1/jobs — Create thật

**File cần sửa:** `backend/app/api/jobs.py`

**Thay đổi:**
- Import `get_db` từ `app.database`
- Import `get_settings` từ `app.config`
- Import Temporal client + workflow
- Sửa `create_video_job`: nhận `db: AsyncSession = Depends(get_db)`, gọi `create_job()`, start Temporal workflow, trả về job thật
- Flow: `create_job(db)` → `client.start_workflow(NewsToVideoWorkflow.run, input, id=job_id, task_queue="news2video-tasks")` → lưu `workflow_id` vào job → return JobResponse

### 1.3 Sửa GET /api/v1/jobs/:id — Trả job thật

**File cần sửa:** `backend/app/api/jobs.py`

- Thêm `db: AsyncSession = Depends(get_db)`
- Gọi `get_job(db, job_id)` → nếu None thì 404, nếu có thì format `JobDetailResponse`

### 1.4 Sửa GET /api/v1/jobs — List jobs

**File cần sửa:** `backend/app/api/jobs.py`

- Thêm `db: AsyncSession = Depends(get_db)`
- Gọi `list_jobs(db, page, page_size)` → trả về list có phân trang

---

## 2. Wire Temporal Client vào API

### 2.1 Tạo Temporal client manager

**File mới:** `backend/app/temporal/client.py`

```
Yêu cầu:
- Singleton Temporal client
- Hàm start_workflow(job_input) -> workflow_handle
- Hàm get_workflow_status(workflow_id) -> status
- Hàm cancel_workflow(workflow_id)
```

**Chi tiết:**
- `async def get_temporal_client() -> Client` — connect to settings.temporal_host
- `async def start_news_video_workflow(job_input: dict, workflow_id: str) -> WorkflowHandle`
- `async def get_workflow_status(workflow_id: str)` — query workflow bằng `client.get_workflow_handle()`

### 2.2 Tạo activity cập nhật progress

**File mới:** `backend/app/temporal/activities/update_progress.py`

```
Yêu cầu:
- Activity gọi từ workflow mỗi khi step hoàn thành
- Ghi vào progress_store (shared dict trong ws.py hoặc Redis)
```

**Chi tiết:**
- `async def update_progress(job_id: str, step_name: str, status: str, duration_ms: int, percent: int)` — cập nhật `progress_store[job_id]`
- Import `progress_store` từ `app.api.ws`

### 2.3 Tích hợp update_progress vào workflow

**File cần sửa:** `backend/app/temporal/workflows.py`

**Thay đổi:**
- Sau mỗi activity, gọi `workflow.execute_activity("update_progress", ...)` 
- Truyền `job_id` qua `job_input["job_id"]`
- Tính `percent` tăng dần: parsing=10%, scripting=30%, tts=50%, rendering=80%, converting=95%, done=100%
- Bọc từng step trong try/catch, nếu fail → update_progress failed rồi raise

---

## 3. Wire WebSocket Progress

### 3.1 Sửa ws.py để nhận progress từ workflow

**File cần sửa:** `backend/app/api/ws.py`

**Thay đổi:**
- `progress_store` đã có sẵn, chỉ cần workflow ghi vào là được
- Thêm disconnect handler cleanup
- Thêm logic: nếu job đã complete/failed → gửi message cuối rồi close
- (Không cần thay đổi cấu trúc, đã đúng pattern)

### 3.2 Verify progress flow

**Test manual:**
- Start job → WS connect → observe progress messages từng step
- Check: parsing → scripting → tts → rendering → converting → completed
- Check: error case → failed message với retryable flag

---

## 4. Wire GET /api/v1/videos

### 4.1 Tạo video_service.py

**File mới:** `backend/app/services/video_service.py`

```
Yêu cầu:
- list_videos(db, page, page_size) -> list[Video]
- get_video(db, video_id) -> Video | None
- get_videos_by_job(db, job_id) -> Video | None
```

### 4.2 Sửa GET /api/v1/videos — List videos

**File cần sửa:** `backend/app/api/videos.py`

- Thêm `db: AsyncSession = Depends(get_db)`
- Gọi `list_videos(db, page, page_size)` → format `VideoListResponse`
- Thêm filter: `?status=completed`, `?format=9x16`

### 4.3 Sửa GET /api/v1/videos/:id — Get video detail

**File cần sửa:** `backend/app/api/videos.py`

- Gọi `get_video(db, video_id)` → nếu None thì 404
- Trả về detail kèm download URLs

---

## 5. Upload Video lên MinIO

### 5.1 Tạo storage service

**File mới:** `backend/app/services/storage.py`

```
Yêu cầu:
- upload_file(local_path, object_name) -> public_url
- get_download_url(object_name, expires_hours=24) -> presigned_url
- delete_file(object_name)
```

**Thư viện:** `minio` (thêm vào requirements.txt)

### 5.2 Tạo upload activity

**File mới:** `backend/app/temporal/activities/upload_storage.py`

```
Yêu cầu:
- Upload file 9x16 và 16x9 lên MinIO
- Trả về {9x16_url, 16x9_url, 9x16_size, 16x9_size}
```

### 5.3 Tích hợp upload vào workflow

**File cần sửa:** `backend/app/temporal/workflows.py`

- Sau bước convert, thêm activity `upload_storage`
- Thêm activity cuối `save_video_to_db` để tạo record Video trong DB

### 5.4 Tạo activity save kết quả vào DB

**File mới:** `backend/app/temporal/activities/save_result.py`

```
Yêu cầu:
- Nhận job_id + kết quả render (paths, sizes, urls)
- Tạo Video record trong DB
- Update Job status = completed
```

**Cách xử lý DB từ activity:** Dùng `async_session` thẳng (không qua DI) hoặc dùng Temporal async activity với DB connection riêng.

---

## 6. Download Endpoint

### 6.1 Sửa GET /api/v1/videos/:id/download

**File cần sửa:** `backend/app/api/videos.py`

- Lấy video từ DB
- Tạo presigned URL từ MinIO cho format được request
- Redirect hoặc trả về URL
- Hoặc: Stream file từ MinIO qua FastAPI (StreamingResponse)

---

## 7. Frontend API Client

### 7.1 Tạo lib/api.ts

**File mới:** `frontend/src/lib/api.ts`

```
Yêu cầu:
- Base URL configurable (env NEXT_PUBLIC_API_URL)
- createJob(content, config) -> JobResponse
- getJob(jobId) -> JobDetailResponse
- listVideos(page, pageSize) -> VideoListResponse
- getVideo(videoId) -> VideoDetail
- getDownloadUrl(videoId, format) -> string
```

**Chi tiết:**
- Dùng `fetch` với error handling
- Type-safe với shared types
- Không hardcode localhost:8000

### 7.2 Sửa new/page.tsx dùng api.ts

**File cần sửa:** `frontend/src/app/new/page.tsx`

- Import `createJob` từ `@/lib/api`
- Thay `fetch("http://localhost:8000/...")` bằng `createJob(content, config)`
- Thêm try/catch với error message UI

---

## 8. Video Detail Page

### 8.1 Tạo app/video/[id]/page.tsx

**File mới:** `frontend/src/app/video/[id]/page.tsx`

```
Yêu cầu:
- Client component ("use client")
- Lấy jobId từ params
- Dùng useJobPolling hook để poll status mỗi 2 giây
- Hiển thị:
  + Nếu processing: ProgressTracker component
  + Nếu completed: VideoPreview (HTML5 player) + Download buttons cho 9x16 và 16x9
  + Nếu failed: Error message + Retry button
  + Nếu queued: "Đang chờ xử lý..."
```

### 8.2 Tạo hooks

**File mới:** `frontend/src/hooks/useJobPolling.ts`

```
Yêu cầu:
- Poll GET /api/v1/jobs/:id mỗi 2 giây
- Dừng khi status = completed | failed
- Trả về { job, isLoading, error }
```

```typescript
export function useJobPolling(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.getJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'completed' || status === 'failed') ? false : 2000;
    },
  });
}
```

### 8.3 Tạo component VideoPreview

**File mới:** `frontend/src/components/VideoPreview.tsx`

```
Yêu cầu:
- HTML5 <video> player
- Nhận src URL
- Controls: play, pause, volume, fullscreen
- Hiển thị format label (9:16 / 16:9)
```

---

## 9. History Page

### 9.1 Tạo app/history/page.tsx

**File mới:** `frontend/src/app/history/page.tsx`

```
Yêu cầu:
- Client component
- Dùng useQuery để fetch GET /api/v1/videos
- Paginated table với columns: Status, Title, Date, Duration, Actions
- Filter: status dropdown, language dropdown
- Mỗi row: icon status, title, ngày tạo, duration, nút Download / Xem lại
- Pagination controls
```

### 9.2 Tạo hook useVideoHistory

**File mới:** `frontend/src/hooks/useVideoHistory.ts`

```
Yêu cầu:
- Fetch list videos với pagination
- Hỗ trợ filter params
- Trả về { videos, pagination, isLoading }
```

---

## 10. Sửa Landing Page Link

**File cần sửa:** `frontend/src/app/landing/page.tsx`

- Sửa `href="/app"` → `href="/new"`

---

## Verification Checklist (Phase 1 Done)

- [ ] `POST /api/v1/jobs` → trả về 202 với job thật, workflow đang chạy
- [ ] `GET /api/v1/jobs/:id` → trả về progress đang tăng dần
- [ ] WebSocket `/api/v1/ws/jobs/:id` → push progress real-time
- [ ] Frontend `/new` → bấm Generate → redirect `/video/:id`
- [ ] `/video/:id` → hiển thị ProgressTracker → khi done hiện VideoPreview + Download
- [ ] Download button → tải được MP4
- [ ] `/history` → hiển thị danh sách video đã tạo
- [ ] MinIO console → thấy file MP4 đã upload
- [ ] Temporal UI → thấy workflow history
