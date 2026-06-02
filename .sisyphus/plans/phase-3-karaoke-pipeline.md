# Phase 3 — Karaoke Subtitle & Pipeline Hoàn Chỉnh

> **Mục tiêu:** Tích hợp WhisperX word alignment → karaoke subtitle trong Remotion + pipeline đầy đủ 7 steps
> **Điều kiện tiên quyết:** Phase 1 hoàn thành (pipeline chạy end-to-end), Phase 2 hoàn thành (frontend hoàn chỉnh)
> **Effort ước tính:** 10-14 giờ
> **Tiêu chí hoàn thành:** Video có karaoke subtitle highlight từng từ, cache hit hoạt động, thumbnail tự động

---

## 1. WhisperX Word Alignment Activity

### 1.1 Tạo align_words activity

**File mới:** `backend/app/temporal/activities/align_words.py`

```
Yêu cầu:
- Input: audio_path (MP3 từ Edge TTS) + text (voiceover text)
- Output: word_segments [{word, start, end}] (thời gian tính bằng giây)
- Dùng WhisperX với model large-v2
- Auto-detect device: MPS (Mac) hoặc CPU
```

**Chi tiết:**
```python
import whisperx

async def align_words(audio_path: str, text: str, language: str = "vi") -> dict:
    device = "cpu"  # Mac MPS có thể lỗi với 1 số model
    model = whisperx.load_model("large-v2", device, compute_type="int8")
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=16)
    
    model_a, metadata = whisperx.load_align_model(
        language_code=language, device=device
    )
    result_aligned = whisperx.align(
        result["segments"], model_a, metadata, audio, device,
        return_char_alignments=False
    )
    
    word_segments = []
    for segment in result_aligned.get("word_segments", []):
        if "word" in segment and "start" in segment and "end" in segment:
            word_segments.append({
                "word": segment["word"],
                "start": segment["start"],
                "end": segment["end"],
            })
    
    return {"word_segments": word_segments, "language": language}
```

### 1.2 Tích hợp vào Workflow

**File cần sửa:** `backend/app/temporal/workflows.py`

**Thay đổi:**
- Sau khi generate TTS cho từng slide → chạy align_words activity
- Lưu `word_segments` vào slide data
- Truyền `wordTimings` vào render_video props
- Activity order mới: parse → script → TTS → **align** → render → convert → upload

**Workflow sequence mới:**
```
parse_content → generate_script → generate_tts (per slide) → align_words (per slide) → render_video → convert_format → upload_storage
```

### 1.3 Cập nhật progress steps

**File cần sửa:** `backend/app/temporal/workflows.py`

- Thêm step "aligning" vào progress calculation
- Phần trăm: parsing=8%, scripting=25%, tts=42%, aligning=55%, rendering=78%, converting=92%, done=100%

---

## 2. Karaoke Subtitle trong Remotion

### 2.1 Tạo LowerThird component

**File mới:** `remotion/src/components/LowerThird.tsx`

```
Yêu cầu:
- Hiển thị phụ đề ở 1/3 dưới màn hình
- Highlight từ đang đọc = màu vàng, các từ khác = trắng
- Animation mượt theo word timestamps
- Responsive với text dài (tự wrap)
```

**Chi tiết thiết kế:**
```tsx
interface LowerThirdProps {
  words: Array<{ word: string; start: number; end: number }>;
  currentTime: number; // giây hiện tại trong slide
}
```

**Logic highlight:**
- Tính `currentTime` từ `useCurrentFrame() / fps`
- Với mỗi word: nếu `currentTime >= word.start && currentTime < word.end` → highlight vàng (#FFD93D)
- Words đã đọc → màu xám mờ (#8B949E)
- Words chưa đọc → màu trắng (#FFFFFF)
- Container: semi-transparent black background, padding, bo góc

**Style:**
```
┌──────────────────────────────────────────────┐
│                                              │
│  Hôm  nay  thị  trường  chứng  khoán  tăng   │
│  ░░░  ░░░  ░░░  ░░░░░░░░  ██████  ██████   │
│  (đã đọc = xám)      (đang đọc = vàng)        │
└──────────────────────────────────────────────┘
```

### 2.2 Tích hợp LowerThird vào NewsSlide

**File cần sửa:** `remotion/src/components/NewsSlide.tsx`

**Thay đổi:**
- Thêm prop `words?: Array<{word, start, end}>`
- Nếu có words → render LowerThird component ở bottom
- Tính `currentTime = frame / fps`
- Container layout: title (30%) → bullets (50%) → subtitle (20%)

### 2.3 Cập nhật NewsVideo composition

**File cần sửa:** `remotion/src/compositions/NewsVideo.tsx`

**Thay đổi:**
- Truyền `wordTimings` từ slide data vào NewsSlide
- Mỗi slide có duration chính xác từ TTS (đã có)
- Transition vẫn giữ fade 0.4s

---

## 3. Content Cache — Full Implementation

### 3.1 API-level cache check

**File cần sửa:** `backend/app/api/jobs.py`

**Thay đổi trong create_video_job:**
1. Hash content + config
2. Query DB: `SELECT * FROM jobs WHERE content_hash = :hash AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`
3. Nếu có cache hit và video vẫn tồn tại trong MinIO:
   - Trả về ngay job đã cached (status = completed, kèm video URLs)
   - Không start workflow mới
4. Nếu không có cache → start workflow bình thường

### 3.2 Cache invalidation

- Thêm endpoint `DELETE /api/v1/cache/:hash` (admin only)
- TTL-based: file trong MinIO tự expire sau 90 ngày
- Job status vẫn giữ completed, nhưng download URL sẽ 404 → frontend hiển thị "Video đã hết hạn"

### 3.3 Hiển thị cache status trong UI

- Khi cache hit → hiển thị badge "⚡ Cached" trên video detail
- Thời gian generate = 0 (trả về ngay)
- Progress bar skip thẳng 100%

---

## 4. Thumbnail Tự Động

### 4.1 Sửa generate_thumbnail activity

**File cần sửa:** `backend/app/temporal/activities/generate_thumbnail.py`

**Yêu cầu:**
- Input: video_path (MP4)
- Output: thumbnail_path (JPG, frame ở giây thứ 2)
- Dùng FFmpeg: `ffmpeg -i input.mp4 -ss 00:00:02 -vframes 1 -q:v 2 thumb.jpg`

### 4.2 Tích hợp thumbnail vào workflow

**File cần sửa:** `backend/app/temporal/workflows.py`

- Sau bước render → generate_thumbnail cho cả 9:16 và 16:9
- Upload thumbnail lên MinIO cùng với video
- Lưu `thumbnail_url` vào Video record

### 4.3 Hiển thị thumbnail trong UI

- Dashboard recent videos: thumbnail nhỏ bên trái title
- History table: thumbnail cột đầu tiên
- Video detail: thumbnail làm poster cho video player

---

## 5. Background Music

### 5.1 Chuẩn bị audio files

**File mới:** `backend/audio/bgm/`

```
Yêu cầu:
- 3-5 file nhạc nền royalty-free (news-style, instrumental)
- Định dạng: MP3, ~2-3 phút
- Đặt tên: news_theme_1.mp3, news_theme_2.mp3, ...
```

### 5.2 Tạo mix_audio activity

**File mới:** `backend/app/temporal/activities/mix_audio.py`

```
Yêu cầu:
- Input: voice_audio_path + bgm_path + volume_ratio
- Output: mixed_audio_path
- Dùng FFmpeg: voice giữ nguyên, bgm giảm -20dB, mix bằng amix filter
- Loudness normalization (EBU R128)
```

**FFmpeg command:**
```bash
ffmpeg -i voice.mp3 -i bgm.mp3 -filter_complex \
  "[1:a]volume=-20dB[bgm];[0:a][bgm]amix=inputs=2:duration=first[out]" \
  -map "[out]" output.mp3
```

### 5.3 Tích hợp vào workflow

**File cần sửa:** `backend/app/temporal/workflows.py`

- Sau TTS, nếu config có `background_music`:
  - Mix voice + bgm → audio mới
  - Thay audio_path trong slide data bằng audio đã mix
  - Sau đó chạy align_words với audio đã mix

---

## 6. Error Handling & Retry Flow

### 6.1 Workflow-level error handling

**File cần sửa:** `backend/app/temporal/workflows.py`

**Thêm:**
- Try/catch toàn bộ workflow
- Nếu activity fail → update progress với error message
- Ghi error_message vào DB
- Đánh dấu job status = failed
- Retryable flag: true nếu lỗi tạm thời (timeout, network), false nếu lỗi vĩnh viễn (invalid input)

### 6.2 Retry UI

**File cần sửa:** `frontend/src/app/video/[id]/page.tsx`

- Failed state: hiển thị error message + "Thử lại" button
- "Thử lại" → POST /api/v1/jobs/:id/retry (endpoint mới)
  - Tạo job mới với cùng content + config
  - Redirect sang /video/:newId

### 6.3 Cancel job

**File cần sửa:** `backend/app/api/jobs.py`

- `DELETE /api/v1/jobs/:id` → cancel Temporal workflow + update status = cancelled
- Frontend: nút "Hủy" trong progress view

---

## 7. Cập Nhật Shared Types

### 7.1 Thêm WordTiming type

**File cần sửa:** `shared/types.ts`

```typescript
export interface WordTiming {
  word: string;
  start: number;  // giây
  end: number;    // giây
}
```

Cập nhật `SlideData`:
```typescript
export interface SlideData {
  // ... existing fields
  wordTimings?: WordTiming[];
}
```

### 7.2 Thêm BackgroundMusic vào VideoConfig

```typescript
export interface VideoConfig {
  // ... existing fields
  background_music: 'none' | 'news_theme_1' | 'news_theme_2' | 'news_theme_3' | null;
}
```

---

## Verification Checklist (Phase 3 Done)

- [ ] WhisperX chạy được: input audio + text → output word timestamps chính xác
- [ ] LowerThird hiển thị karaoke subtitle trong Remotion preview
- [ ] Highlight từng từ theo đúng timeline khi phát video
- [ ] Cache hit: gửi cùng content → trả về ngay video cũ (không re-render)
- [ ] Thumbnail hiển thị trong dashboard + history
- [ ] Background music mix đúng: voice rõ, nhạc nền nhỏ
- [ ] Error flow: Ollama timeout → hiển thị lỗi + retry button
- [ ] Cancel flow: bấm Hủy → job status = cancelled
- [ ] Full workflow 7 steps: parse → script → TTS → align → render → convert → upload
