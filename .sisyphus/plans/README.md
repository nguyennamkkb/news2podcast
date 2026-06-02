# News2Video — Kế Hoạch Phát Triển

> **Ngày lập:** 02/06/2026
> **Căn cứ:** PRD v1.0 + Research Report + Audit codebase hiện tại
> **Tiến độ hiện tại:** ~25-30% (đang giữa Milestone 1-2 của PRD gốc)

---

## Tổng Quan 4 Phase

```
Phase 1 ────────► Phase 2 ────────► Phase 3 ────────► Phase 4
Wire Glue         Frontend          Karaoke +         Polish &
(8-10h)           Hoàn Chỉnh        Pipeline          Ship
                  (12-16h)          (10-14h)          (12-16h)
                                                                    
TOTAL: ~42-56 giờ
──────────────────────────────────────────────────────────────────────►
Tuần 1-2           Tuần 3-4          Tuần 5-6          Tuần 7-8
```

| Phase | File kế hoạch | Mục tiêu chính | Effort | Phụ thuộc |
|-------|--------------|---------------|--------|-----------|
| **1** | [phase-1-wire-glue.md](./phase-1-wire-glue.md) | Nối API → DB → Temporal → WS để happy path chạy | 8-10h | Không |
| **2** | [phase-2-frontend-complete.md](./phase-2-frontend-complete.md) | Hoàn thiện 6 screen frontend theo PRD | 12-16h | Phase 1 |
| **3** | [phase-3-karaoke-pipeline.md](./phase-3-karaoke-pipeline.md) | WhisperX, karaoke subtitle, cache, thumbnail | 10-14h | Phase 1,2 |
| **4** | [phase-4-polish-ship.md](./phase-4-polish-ship.md) | Performance, testing, deploy, landing page | 12-16h | Phase 1,2,3 |

---

## Hiện Trạng Trước Khi Bắt Đầu

### ✅ Đã hoàn thành

| Hạng mục | Chi tiết |
|----------|---------|
| Docker Compose | 6 services: Postgres, Redis, MinIO, Temporal, Temporal UI |
| Backend models | Job + Video SQLAlchemy (khớp PRD schema) |
| Pydantic schemas | Đầy đủ request/response types |
| Pipeline activities | parse, script, TTS, render, convert (chạy độc lập) |
| Temporal workflow | NewsToVideoWorkflow 5-step |
| Remotion | NewsSlide + NewsVideo + TransitionSeries |
| Design tokens | Đồng bộ Tailwind ↔ Remotion |
| Shared types | TypeScript types cho frontend + remotion |
| Config layer | Pydantic Settings với env vars |
| Content cache | SHA-256 hash logic |
| Frontend shell | Dashboard, New, Landing (static/tĩnh) |

### ❌ Chưa hoàn thành

| Hạng mục | Ảnh hưởng |
|----------|-----------|
| DB session chưa wired vào API | Tất cả endpoint trả về stub/501 |
| Temporal client chưa có trong API | Không start được workflow từ web |
| WebSocket progress chưa có data | ProgressTracker hiển thị rỗng |
| 5/8 page frontend chưa có | dashboard, history, video/:id, settings |
| MinIO upload chưa có | Video render xong không lưu được |
| WhisperX chưa integrate | Không có karaoke subtitle |
| LowerThird component | Chưa code |

---

## Cấu Trúc Thư Mục Kế Hoạch

```
.sisyphus/plans/
├── README.md                       ← File này (index)
├── phase-1-wire-glue.md            ← Phase 1 chi tiết
├── phase-2-frontend-complete.md    ← Phase 2 chi tiết
├── phase-3-karaoke-pipeline.md     ← Phase 3 chi tiết
└── phase-4-polish-ship.md          ← Phase 4 chi tiết
```

---

## Quy Ước

- **P0** = Chặn happy path, phải làm ngay
- **P1** = Quan trọng, làm trong phase
- **P2** = Nice-to-have, có thể lùi
- Mỗi task có: file cụ thể, mô tả chi tiết, expected output
- Verification checklist ở cuối mỗi phase
