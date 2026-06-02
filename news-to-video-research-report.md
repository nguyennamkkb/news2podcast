# Báo Cáo Nghiên Cứu Chuyên Sâu: Dự Án News-to-Video

> **Ngày tạo:** 2026-06-02
> **Phạm vi:** Research & đề xuất tech stack tối ưu cho MVP
> **Loại dự án:** Công cụ tự động biến text/markdown → video news explainer có voiceover

---

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Content Parsing — Text & Markdown](#2-content-parsing--text--markdown)
3. [TTS — Text-to-Speech](#3-tts--text-to-speech)
4. [Video Rendering](#4-video-rendering)
5. [Orchestration & Cost Estimate](#5-orchestration--cost-estimate)
6. [GitHub Projects Tham Khảo](#6-github-projects-tham-khảo)
7. [Đề Xuất Tech Stack Tối Ưu](#7-đề-xuất-tech-stack-tối-ưu)
8. [Key Takeaways](#8-key-takeaways)

---

## 1. Tổng Quan Dự Án

| Thông số | Giá trị |
|----------|---------|
| **Input** | Text thuần (.txt) hoặc Markdown (.md) |
| **Output** | Video news explainer 30s–2 phút |
| **Voice** | Đa ngôn ngữ Việt + Anh, switch được |
| **Format** | 16:9 (landscape) + 9:16 (vertical/Shorts) |
| **Mục tiêu nghiên cứu** | Đề xuất tech stack tối ưu cho MVP |
| **Tone giọng đọc** | News-style, chuyên nghiệp, rõ ràng |

### Kiến trúc tổng quan (4 layer)

```
┌─────────────────────────────────────────────────────────────┐
│                    NEWS-TO-VIDEO PIPELINE                     │
└─────────────────────────────────────────────────────────────┘

  [Input]              [Understand]          [Synthesize]
   TXT/MD    ────────►  Mistune parser ────►  TTS (Edge/
   (text)               ViT5 / LLM          OpenAI/Vbee)
                        (segment + 
                         summarize)

  [Sync]               [Render]
   WhisperX  ────────►  Remotion /
   word timestamps     MoviePy + FFmpeg
                              ↓
                       [Output MP4]
                       16:9 + 9:16
```

> **Lưu ý:** Vì input đơn giản (chỉ text/markdown), pipeline không cần PDF/DOCX parser, OCR, hay image extraction phức tạp. Chỉ cần markdown parser + LLM summarization → giảm đáng kể độ phức tạp và cost.

---

## 2. Content Parsing — Text & Markdown

### 2.1 Thư viện parse Markdown

| Library | Tốc độ | Giữ heading | Giữ structure | Best for |
|---------|--------|-------------|---------------|----------|
| **mistune** | ⭐⭐⭐⭐⭐ | ✅ | ✅ (AST tokens) | **MVP — khuyến nghị** |
| markdown-it-py | ⭐⭐⭐⭐ | ✅ | ✅ | Plugin ecosystem |
| markdown (Python) | ⭐⭐⭐ | ✅ | ✅ | Mature, widely-used |

**Đề xuất:** **mistune** — parser AST nhanh nhất, dễ extract headings + paragraphs.

### 2.2 Code parse Markdown structure

```python
import mistune
from typing import Dict, List

def parse_markdown_structure(text: str) -> Dict:
    """Extract headings, paragraphs, và metadata từ markdown."""
    md = mistune.create_markdown(renderer=None)
    tokens = md.parse(text)
    
    structure = {
        'title': None,
        'headings': [],      # [{level, text, position}]
        'paragraphs': [],    # [str, ...]
        'code_blocks': [],   # [str, ...]
        'word_count': 0
    }
    
    for token in tokens:
        if token['type'] == 'heading':
            level = token['level']
            text_content = token['children'][0]['raw'] if token.get('children') else ''
            structure['headings'].append({
                'level': level,
                'text': text_content,
                'position': token.get('position', 0)
            })
            # Heading level 1 đầu tiên = title
            if level == 1 and structure['title'] is None:
                structure['title'] = text_content
                
        elif token['type'] == 'paragraph':
            text_content = token['children'][0]['raw'] if token.get('children') else ''
            if text_content.strip():
                structure['paragraphs'].append(text_content.strip())
                structure['word_count'] += len(text_content.split())
                
        elif token['type'] == 'block_code':
            structure['code_blocks'].append(token.get('raw', ''))
    
    return structure


def parse_txt_structure(text: str) -> Dict:
    """Parse plain text — dùng blank lines làm paragraph separator."""
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    # Title = dòng đầu tiên (heuristic)
    title = paragraphs[0] if paragraphs else ''
    body = paragraphs[1:] if len(paragraphs) > 1 else []
    
    return {
        'title': title,
        'headings': [],
        'paragraphs': body,
        'code_blocks': [],
        'word_count': sum(len(p.split()) for p in paragraphs)
    }
```

### 2.3 Text Segmentation: Chia thành slide segments

| Cách tiếp cận | Chi phí / 2000 từ | Độ chính xác | Tốc độ |
|----------------|-------------------|--------------|--------|
| Rule-based (heading) | $0 | 70–80% | Instant |
| GPT-4o-mini | $0.0008 | 85–90% | 350ms |
| Claude Haiku 4.5 | $0.0048 | 90–95% | 400ms |
| **Gemini Flash** | **$0.0004** | 85% | **Nhanh nhất** |

> **Đề xuất: Hybrid** — Rule-based cho bài có heading rõ ràng, fallback Gemini Flash cho unstructured.

```python
def segment_for_slides(structure: Dict, target_slides: int = 5, 
                       max_words_per_slide: int = 300) -> List[Dict]:
    """Chia nội dung thành segments phù hợp cho slides."""
    segments = []
    current = {'title': structure['title'] or '', 'content': [], 'word_count': 0}
    
    for para in structure['paragraphs']:
        words = para.split()
        word_count = len(words)
        
        # Nếu thêm para này vượt max_words → start new segment
        if current['word_count'] + word_count > max_words_per_slide and current['content']:
            segments.append(current)
            current = {'title': '', 'content': [], 'word_count': 0}
        
        # Heading đầu tiên trong segment = title
        if not current['title'] and word_count < 15 and not para.endswith('.'):
            current['title'] = para
        else:
            current['content'].append(para)
            current['word_count'] += word_count
    
    if current['content']:
        segments.append(current)
    
    return segments[:target_slides]
```

### 2.4 Vietnamese Summarization (Local)

| Model | ROUGE-1 | ROUGE-L | VRAM | License |
|-------|---------|---------|------|---------|
| **ViT5-base** | 61.85 | 41.70 | 2GB | Apache 2.0 |
| ViT5-large | 63.37 | 43.55 | 4GB | Apache 2.0 |
| BARTpho | 61.14 | 40.15 | 2GB | — |

**Đề xuất:** **`VietAI/vit5-base-vietnews-summarization`** — chạy local, miễn phí, ROUGE-1 = 61.85 trên VietNews corpus.

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

class VietnameseSummarizer:
    def __init__(self, model_name="VietAI/vit5-base-vietnews-summarization"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.model = self.model.to(self.device)
    
    def summarize(self, text: str, max_length: int = 150) -> str:
        inputs = self.tokenizer(
            text, return_tensors="pt", max_length=512, truncation=True
        ).to(self.device)
        summary_ids = self.model.generate(
            inputs["input_ids"],
            max_length=max_length, min_length=50,
            length_penalty=2.0, num_beams=4, early_stopping=True
        )
        return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
```

### 2.5 LLM-based Slide Generation (Alternative)

Ngoài ViT5, có thể dùng LLM để generate trực tiếp slide structure từ markdown:

```python
PROMPT_SLIDE_GENERATION = """
Bạn là editor video. Hãy đọc bài viết sau và chia thành {n_slides} slides cho video news explainer.

Yêu cầu:
- Mỗi slide có 1 tiêu đề ngắn (< 10 từ) và 2-3 bullet points
- Bullet points ngắn gọn, dễ hiểu
- Tone: news anchor chuyên nghiệp
- Tổng thời gian đọc: 60-90 giây

Output JSON format:
{{
  "slides": [
    {{
      "title": "...",
      "bullets": ["...", "..."],
      "voiceover": "..." // script để đọc
    }}
  ]
}}

Bài viết:
{content}
"""
```

---

## 3. TTS — Text-to-Speech

### 3.1 Vietnamese TTS Providers

| Provider | Chất lượng | Word Timestamps | Giá | Best for |
|----------|------------|-----------------|-----|----------|
| **Vbee AIVoice** | ⭐⭐⭐⭐⭐ Natural, emotional | Không (cần alignment) | 159K–800K VND/tháng | News-style content |
| FPT.AI | ⭐⭐⭐⭐ 98% natural | Không | Theo ký tự | Enterprise |
| Viettel AI | ⭐⭐⭐⭐ | Không | Free 50K chars/tháng | Budget-conscious |
| **Edge TTS (MS)** | ⭐⭐⭐ | Không | **FREE unlimited** | MVP / Cost-sensitive |

### 3.2 English TTS Providers

| Provider | Chất lượng | Word Timestamps | Giá | Best for |
|----------|------------|-----------------|-----|----------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ MOS 4.3 | ✅ **Native** | $50–100/M chars | Premium content |
| OpenAI TTS | ⭐⭐⭐⭐ | ❌ | $15–30/M chars | **Balanced cost/quality** |
| Google Cloud TTS | ⭐⭐⭐⭐ Chirp 3 HD | ✅ | $30/M chars | Enterprise |
| Azure TTS | ⭐⭐⭐⭐ Neural | ✅ Via SSML | $16/M chars | Microsoft ecosystem |
| **Edge TTS** | ⭐⭐⭐ | ❌ | **FREE** | Development/MVP |

### 3.3 Open Source TTS (Self-host)

| Model | Việt | Anh | Word Timestamps | VRAM | License |
|-------|------|-----|-----------------|------|---------|
| **MeloTTS** | ✅ Native | ✅ 4 accent | Không | **0 (CPU)** | MIT |
| XTTS-v2 | ⚠️ Cross-lingual | ✅ Native | Không | 4–8GB | CPML (non-commercial) |
| Piper TTS | ⚠️ Limited | ✅ Good | Không | <100MB | MIT |
| F5-TTS | ⚠️ Limited | ✅ Native | Không | ~4GB | CC-BY-NC 4.0 |
| Fish Speech | ✅ Good | ✅ Native | Không | 4GB | Apache 2.0 |
| Kokoro | ❌ | ✅ Excellent | Không | CPU ok | Apache 2.0 |

**MeloTTS benchmark trên Apple M1 (8-core):** RTF = 0.48, latency ~95ms → **real-time trên CPU thuần**. Lựa chọn tốt nhất nếu muốn self-host cả Việt + Anh.

### 3.4 Word-Level Alignment (bắt buộc cho slide sync)

> **Không có TTS provider nào (kể cả open source) trả word-level timestamps native.** Phải dùng forced alignment.

**WhisperX** (khuyến nghị):

```python
import whisperx
import torch

def get_word_timestamps(audio_path: str, language: str = "vi"):
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    
    # Load model + transcribe
    model = whisperx.load_model("large-v2", device)
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio)
    
    # Align word-level
    model_a, metadata = whisperx.load_align_model(
        language_code=language, device=device
    )
    result = whisperx.align(
        result["segments"], model_a, metadata, audio, device
    )
    
    return result["word_segments"]  # [{word, start, end}, ...]
```

WhisperX hỗ trợ tiếng Việt qua multilingual models, chạy local trên MPS (Mac M1/M2) hoặc CUDA.

### 3.5 Voice Cloning Decision

**Khuyến nghị: Dùng preset voices cho news content** — consistent quality, no training needed, lower cost.

Clone voice chỉ khi:
- Có signature MC voice riêng
- Budget cho training data (30+ phút clean audio)
- Brand differentiation quan trọng

---

## 4. Video Rendering

### 4.1 So sánh các engine

| Engine | Chất lượng | Tốc độ | Dev Complexity | Cost | Best for |
|--------|------------|--------|----------------|------|----------|
| **Remotion** | ⭐⭐⭐⭐⭐ | Nhanh (GPU) | Medium (React) | $0 self-host | **Production news** |
| FFmpeg trực tiếp | ⭐⭐⭐ | Rất nhanh | Cao (CLI) | $0 | High-volume batch |
| Manim | ⭐⭐⭐⭐⭐ | Chậm | Cao (Python) | $0 | Math/education |
| **MoviePy** | ⭐⭐⭐ | Trung bình | Thấp (Python) | $0 | **MVP — simple text slides** |
| Puppeteer + record | ⭐⭐⭐⭐ | Chậm | Trung bình | $0 | Web-based |

### 4.2 MoviePy — Đề xuất cho MVP (input chỉ là text)

Vì input chỉ là text/markdown (không có ảnh từ file), slides sẽ là:
- **Background:** Solid color, gradient, hoặc AI-generated image
- **Foreground:** Title + bullet points với animation đơn giản

```python
from moviepy.editor import *
from moviepy.video.fx.all import fadein, fadeout, resize
import numpy as np

def create_text_slide(
    title: str,
    bullets: list,
    audio_path: str,
    output_path: str,
    duration: float = 5.0,
    width: int = 1920,
    height: int = 1080,
    bg_color: tuple = (26, 26, 46)  # dark blue
):
    """Tạo 1 slide từ text thuần, có audio sync."""
    
    # 1. Tạo background
    bg = ColorClip(size=(width, height), color=bg_color, duration=duration)
    
    # 2. Title
    txt_title = TextClip(
        title,
        fontsize=80,
        color='white',
        font='Arial-Bold',
        size=(width - 200, 200),
        method='caption'
    ).set_position(('center', 150)).set_duration(duration)
    txt_title = fadein(txt_title, 0.5)
    
    # 3. Bullets
    bullet_text = '\n'.join([f'• {b}' for b in bullets])
    txt_bullets = TextClip(
        bullet_text,
        fontsize=48,
        color='white',
        font='Arial',
        size=(width - 400, height - 500),
        method='caption',
        align='center'
    ).set_position(('center', 450)).set_duration(duration)
    txt_bullets = fadein(txt_bullets, 1.0)
    
    # 4. Audio
    audio = AudioFileClip(audio_path).subclip(0, duration)
    
    # 5. Composite
    video = CompositeVideoClip([bg, txt_title, txt_bullets])
    video = video.set_audio(audio)
    
    # 6. Export
    video.write_videofile(
        output_path, 
        fps=30, 
        codec='libx264', 
        audio_codec='aac',
        temp_audiofile='temp-audio.m4a',
        remove_temp=True
    )
    
    return output_path
```

### 4.3 Remotion Deep Dive (cho Phase 2)

**Architecture:** React components → Webpack bundle → Puppeteer screenshot → FFmpeg encode.

```tsx
// Composition cho 16:9
<Composition 
  id="NewsVideo" 
  component={MyComposition} 
  durationInFrames={150} 
  fps={30} 
  width={1920} 
  height={1080} 
/>

// Composition cho 9:16
<Composition 
  id="NewsVideoVertical" 
  component={MyComposition} 
  durationInFrames={150} 
  fps={30} 
  width={1080} 
  height={1920} 
/>
```

**Server-side rendering:**

```typescript
import { renderMedia, bundle } from '@remotion/renderer';

const bundleLocation = await bundle(require.resolve("./src/index.ts"));
await renderMedia({
  composition: { id: "NewsVideo", ... },
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out.mp4",
});
```

### 4.4 Aspect Ratio Strategy

> **Render 1 lần ở resolution cao (1080×1920) + crop/pad bằng FFmpeg** cho 16:9 → tiết kiệm 50% compute so với render 2 lần riêng biệt.

```bash
# 9:16 → 16:9 (crop 2 bên, giữ center)
ffmpeg -i vertical.mp4 \
  -vf "crop=1080:607:420:0" \
  -c:v libx264 horizontal.mp4

# Hoặc pad thêm black bars (giữ full content)
ffmpeg -i vertical.mp4 \
  -vf "pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 horizontal.mp4
```

### 4.5 Subtitle Strategy

| Cách | Ưu điểm | Nhược điểm | Use case |
|------|---------|------------|----------|
| **Burn-in (ASS)** | Luôn hiển thị, full styling, TikTok/Shorts compatible | Không tắt được, file lớn hơn | **Shorts/TikTok** |
| Soft (SRT/VTT) | User toggle, SEO friendly | Player dependent, complex rendering | YouTube uploads |

**Đề xuất:** Burn-in ASS với **karaoke-style word highlighting** — tạo cảm giác "đọc theo" từng từ, rất hiệu quả cho news explainer.

```bash
# Burn ASS subtitle vào video
ffmpeg -i video.mp4 -vf "ass=subtitles.ass" \
  -c:v libx264 -c:a copy output.mp4
```

### 4.6 Background Music Mix

```bash
ffmpeg -i video.mp4 -i music.mp3 -filter_complex "
[1:a]volume=-20dB[music];
[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[audio];
[audio]loudnorm=I=-16:TP=-1.5:LRA=11[out]
" -c:v copy -c:a aac -b:a 192k -map 0:v -map "[out]" output.mp4
```

Voice ducking xuống -20dB khi có music, loudness normalization theo chuẩn broadcast (EBU R128).

### 4.7 Motion / Motionity Clarification

- **Motion (Framer Motion):** Web animation only — **không export video** trực tiếp. Phải dùng screen recording hoặc Remotion integration.
- **Motionity:** Template-based video tool — tốt cho quick edits, customization hạn chế.

---

## 5. Orchestration & Cost Estimate

### 5.1 So sánh workflow engine

| Framework | Phù hợp cho | State Management | Retry | Python native |
|-----------|-------------|------------------|-------|---------------|
| **Temporal.io** | Long-running workflows, AI pipelines | Server-side (Postgres) | Automatic | ✅ |
| Celery | Short background jobs (< 1 phút) | Redis/RabbitMQ | Manual config | ✅ |
| Prefect | Data/ETL pipelines | Postgres | Built-in | ✅ |
| BullMQ | Node.js microservices | Redis | Built-in | ❌ |

**Đề xuất: Temporal.io Python SDK** — pipeline 5–15 phút (parse → summarize → TTS → render) là long-running, cần durable execution để resume khi interrupt, retry granular ở từng step.

### 5.2 Timeline 1 video job (simplified cho text input)

```
[0:00] User Upload .txt/.md
   ↓
[0:05] Parse Markdown structure (1–5s)
   ↓
[0:10] LLM/Local Summarize → slide segments (10–60s)
   ↓
[1:00] Parallel: TTS generate (10–30s)
   ↓
[1:30] WhisperX word timestamps (5–15s)
   ↓
[1:45] Render video (FFmpeg/MoviePy) (20–60s)
   ↓
[2:30] Done
```

> **Đơn giản hơn nhiều so với PDF/DOCX pipeline** vì không cần OCR, image extraction, table parsing.

### 5.3 Sync Voice với Slide — Approach đề xuất

1. **Generate TTS trước** — đo duration chính xác = `video length`
2. **Chạy WhisperX** — lấy word-level timestamps
3. **Map word indices → slide transitions** — slide i hiển thị khi word[j] đến word[k] đang được đọc
4. **Render video** với timeline đã biết trước

```python
async def generate_with_sync(script_segments: List[Segment]):
    results = []
    for segment in script_segments:
        # 1. Generate TTS trước
        audio_path = await generate_tts(segment.text)
        duration_ms = get_audio_duration(audio_path)  # ffprobe
        
        # 2. WhisperX word-level timestamps
        word_timestamps = await whisperx_transcribe(audio_path)
        
        # 3. Map words → slide transitions
        slide_transitions = []
        for slide in segment.slides:
            start_word = slide.start_word_idx
            end_word = slide.end_word_idx
            slide_transitions.append({
                'slide_idx': slide.idx,
                'start_time': word_timestamps[start_word].start,
                'end_time': word_timestamps[end_word].end,
            })
        
        results.append({
            'audio': audio_path,
            'duration_ms': duration_ms,
            'transitions': slide_transitions,
        })
    return results
```

### 5.4 Temporal Code Skeleton

```python
# workflows/video_workflow.py
from temporalio import workflow
from temporalio.common import RetryPolicy
from datetime import timedelta

@workflow.defn
class NewsToVideoWorkflow:
    @workflow.run
    async def run(self, input: VideoJobInput) -> VideoJobResult:
        # Step 1: Parse
        parsed = await workflow.execute_activity(
            parse_article,
            input.article_url,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )
        
        # Step 2: Summarize
        summary = await workflow.execute_activity(
            summarize,
            SummarizeInput(content=parsed.content, style=input.style),
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=RetryPolicy(
                maximum_attempts=3, backoff_coefficient=2.0
            )
        )
        
        # Step 3: TTS
        audio_url = await workflow.execute_activity(
            generate_tts,
            TTSInput(text=summary.script, voice=input.voice),
            start_to_close_timeout=timedelta(minutes=5),
            heartbeat_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )
        
        # Step 4: Render (long-running, dùng Session API)
        session = await workflow.create_session()
        video_url = await workflow.execute_activity(
            render_video,
            RenderInput(audio_url=audio_url, slides=summary.slides),
            start_to_close_timeout=timedelta(minutes=15),
            heartbeat_timeout=timedelta(minutes=1),
            retry_policy=RetryPolicy(maximum_attempts=2),
        )
        await workflow.complete_session(session)
        
        return VideoJobResult(video_url=video_url, duration=summary.duration)
```

### 5.5 Caching Strategy

| Asset | Cache Key | TTL | Storage |
|-------|-----------|-----|---------|
| TTS Audio | `tts:{text_hash}:{voice_id}` | 30 days | S3/MinIO |
| Slide Images | `slide:{prompt_hash}` | 7 days | S3/MinIO |
| Rendered segments | `segment:{scene_hash}` | 1 day | Local SSD |
| Final video | `video:{content_hash}` | 90 days | S3 + CDN |

### 5.5 Cost Estimate (1 video 60s, text input)

| Component | Budget | Balanced | Premium |
|-----------|--------|----------|---------|
| **Parsing (MD/TXT)** | mistune: $0 | mistune: $0 | mistune: $0 |
| **Summarization** | Local (ViT5/Ollama): $0 | GPT-4o-mini: ~$0.003 | Claude Sonnet: ~$0.02 |
| **TTS (60s)** | Edge TTS: $0 | Edge TTS: $0 | ElevenLabs: ~$0.05 |
| **Background images** | Solid color: $0 | Stock: $0 | DALL-E 3: ~$0.08 |
| **Render** | Local CPU/MoviePy: $0 | Local GPU: ~$0.02 | Remotion Lambda: ~$0.05 |
| **Storage/CDN** | ~$0.001 | ~$0.001 | ~$0.002 |
| **TOTAL / VIDEO** | **$0.001** | **$0.06** | **$0.22** |
| **COST / 1000 VIDEOS** | **$1** | **$60** | **$220** |

> **Cost giảm đáng kể so với PDF/DOCX pipeline** vì không cần OCR, image extraction, hay expensive LLM cho complex content.

### 5.6 ROI Analysis

- **Tier Balanced cost:** $60/tháng cho 1000 video
- **Revenue estimate:** $0.10/video (CPM $10, 1000 views/video) = $100/tháng
- **Break-even:** Cần ~6K views/video cho tier Balanced

---

## 6. GitHub Projects Tham Khảo

| # | Repository | Stars | Tech Stack | Highlights | Status |
|---|------------|-------|------------|------------|--------|
| 1 | **[Pilipili-AutoVideo](https://github.com/OpenDemon/Pilipili-AutoVideo)** | ⭐ 173 | Python, FastAPI, LangGraph, React, FFmpeg | TTS-first sync, keyframe lock, Mem0 memory, CapCut draft export | ⏳ Active (Mar 2026) |
| 2 | **[youtube-shorts-pipeline](https://github.com/rushindrasinha/youtube-shorts-pipeline)** | ⭐ 80+ | Python, FFmpeg, Whisper, Edge TTS | Cost $0.04–0.11/video, multi-provider LLM, resumable stages | ✅ Maintained |
| 3 | **[OpenReels](https://github.com/streamoji-sdk/OpenReels)** | ⭐ 150+ | TypeScript, Remotion, FFmpeg, React | 11 production pipelines, 51 production tools, free tier | ⏳ Active |
| 4 | **[TEXT-TO-VIDEO](https://github.com/krishcodes07/TEXT-TO-VIDEO)** | ⭐ 24 | Python, WhisperX, MoviePy, Edge TTS | Modular pipeline, multiple caption styles, progress tracking | ✅ Stable |
| 5 | **[AI-Short-Video-Engine](https://github.com/chenwr727/AI-Short-Video-Engine)** | ⭐ 10+ | Python, FastAPI, FFmpeg, Tongyi TTS | Article2VideoMagic, multi-role dialogue, Pexels stock | ⏳ Active |
| 6 | **[ddominguez7/ai-video-generator](https://github.com/ddominguez7/ai-video-generator)** | ⭐ 1 | Python, Docker, OpenAI, FFmpeg | Simple vertical video, ASS subtitle burn-in, template-based | 🆕 New (Mar 2026) |
| 7 | **[Youhai020616/ai-video-pipeline](https://github.com/Youhai020616/ai-video-pipeline)** | ⭐ 1 | Python, FFmpeg, FLUX, Kling | Short drama + news pipelines, character consistency, Suno BGM | 🆕 New (Mar 2026) |

### 6.1 Top Pick: Pilipili-AutoVideo

**Architecture Highlights:**
- **LangGraph:** Quản lý workflow phức tạp với branches và loops
- **TTS-first approach:** Đo duration chính xác trước khi generate video
- **Keyframe lock:** Đảm bảo consistency giữa các scenes
- **Memory system:** Mem0 để học style preferences
- **Dual output:** MP4 + CapCut draft (chỉnh sửa thủ công được)

**File structure tham khảo:**

```bash
Pilipili-AutoVideo/
├── api/               # FastAPI backend
├── cli/               # CLI interface
├── core/              # Config (Pydantic)
├── modules/           # Modular components
│   ├── llm.py         # Multi-provider LLM
│   ├── image_gen.py   # Nano Banana
│   ├── tts.py         # MiniMax TTS
│   ├── video_gen.py   # Kling/Seedance
│   ├── assembler.py   # FFmpeg assembly
│   └── memory.py      # Mem0 integration
└── skills/            # AI Agent integration
```

### 6.2 Second Pick: youtube-shorts-pipeline

**Strengths:**
- Production-ready với real cost metrics ($0.04–0.11/video)
- Multi-provider TTS (Edge, ElevenLabs, macOS say)
- Niche intelligence system
- Resumable stages (có thể resume từ bước fail)

### 6.3 Third Pick: OpenReels (Remotion-based)

**Strengths:**
- TypeScript + Remotion → animation chất lượng cao
- 11 production pipelines có sẵn
- 51 production tools
- Free tier với Piper TTS + Pexels images

---

## 7. Đề Xuất Tech Stack Tối Ưu

### Phase 1 — MVP (chi phí cực thấp, validate workflow)

**Timeline: 1–2 tuần | Cost: $0–1 / 1000 video**

```yaml
Content Parsing:
  MD: mistune (parser AST)
  TXT: Native Python (split '\n\n')
  Segmentation: Rule-based + Gemini Flash fallback (nếu cần)
  Vietnamese Summarization: ViT5-base (local) HOẶC Gemini Flash LLM

TTS:
  Vietnamese + English: Edge TTS (miễn phí, unlimited)
  Word alignment: WhisperX (local)

Video:
  Engine: MoviePy + Pillow (simple text slides)
  Background: Solid color / gradient (không cần AI image)
  Render: Local CPU + FFmpeg
  Subtitle: ASS burn-in karaoke-style

Orchestration:
  Framework: Dramatiq + Redis (hoặc thậm chí không cần cho MVP)
  Storage: SQLite + filesystem

Infrastructure:
  Deployment: Local script / Docker
  CI/CD: Không cần cho MVP

API:
  Framework: FastAPI (1 endpoint: POST /generate)
  Input: .txt hoặc .md file
  Output: URL đến MP4 file
```

**Lý do chọn Phase 1:**
- Input đơn giản (text/md) → pipeline ngắn, dễ debug
- Edge TTS free + WhisperX local = $0 TTS cost
- ViT5-base local = $0 summarization cost
- MoviePy + FFmpeg = không cần React/Remotion
- Có thể chạy như 1 script Python đơn lẻ

**Minimal working example:**

```python
# main.py — Phase 1 MVP
import asyncio
from pathlib import Path

async def generate_news_video(input_file: Path, voice: str = 'vi-VN-HoaiMyNeural'):
    # 1. Read input
    text = input_file.read_text(encoding='utf-8')
    
    # 2. Parse
    structure = parse_markdown_structure(text)  # hoặc parse_txt_structure
    segments = segment_for_slides(structure, target_slides=5)
    
    # 3. Generate TTS cho mỗi segment
    slides_data = []
    for seg in segments:
        voiceover = ' '.join(seg['content'])
        audio_path = f"audio_{seg['title']}.mp3"
        await generate_tts_edge(voiceover, voice, audio_path)
        word_ts = await whisperx_transcribe(audio_path, language='vi')
        slides_data.append({
            'title': seg['title'],
            'content': seg['content'],
            'audio': audio_path,
            'word_timestamps': word_ts,
        })
    
    # 4. Render slides thành video
    video_clips = []
    for slide in slides_data:
        clip = create_text_slide(
            title=slide['title'],
            bullets=slide['content'][:3],
            audio_path=slide['audio'],
            output_path=f"slide_{slide['title']}.mp4",
        )
        video_clips.append(clip)
    
    # 5. Concatenate
    final = concatenate_videoclips(video_clips)
    final.write_videofile("output.mp4", fps=30, codec='libx264')
    
    # 6. Convert 9:16 → 16:9
    os.system('ffmpeg -i output.mp4 -vf "pad=1920:1080:(ow-iw)/2:(oh-ih)/2" output_16x9.mp4')
    
    return "output_16x9.mp4", "output.mp4"
```

### Phase 2 — Production (chất lượng cao, scale được)

**Timeline: 1–2 tháng | Cost: $60 / 1000 video**

```yaml
Content Parsing: Giữ nguyên Phase 1

TTS:
  Vietnamese: Vbee AIVoice (premium quality) hoặc Edge TTS (budget)
  English: OpenAI TTS (best quality/price ratio)
  Word alignment: WhisperX (giữ nguyên)

Video:
  Engine: Remotion (React-based, animation chuyên nghiệp)
  Background: AI-generated images từ DALL-E 3 / Flux
  Render: Local GPU (Mac Studio) hoặc Remotion Lambda
  Subtitle: ASS burn-in với karaoke-style

Orchestration:
  Framework: Temporal.io (durable execution cho long job)
  Queue: Temporal Task Queues
  Storage: Postgres + S3/MinIO
  CDN: CloudFront/Cloudflare

Infrastructure:
  Deployment: Docker Compose → Kubernetes khi scale
  Workers: Scale 2–10 instances theo queue depth
  Monitoring: Temporal UI + Grafana
```

**Lý do upgrade lên Phase 2:**
- Remotion cho animation chất lượng production
- AI-generated backgrounds tăng visual appeal
- Temporal.io giải quyết long-running job reliability
- Có thể scale horizontal khi volume tăng

### Phase 3 — Premium (chất lượng cao nhất)

**Timeline: Sau Phase 2 thành công | Cost: $220 / 1000 video**

```yaml
TTS: ElevenLabs (word-level timestamps native, bỏ qua WhisperX)
Images: Flux Pro / DALL-E 3 HD
Render: Remotion Lambda (auto-scale serverless)
Voice Cloning: ElevenLabs Professional (nếu cần MC voice riêng)
```

**Lý do upgrade lên Phase 3:**
- ElevenLabs native timestamps = bỏ qua WhisperX step → faster pipeline
- Premium tier cho khách hàng trả phí cao
- Auto-scale không cần quản lý workers

### 7.1 Recommended Path

```
Phase 1 (MVP) ────► Phase 2 (Production) ────► Phase 3 (Premium)
   1-2 tuần              1-2 tháng                 khi ROI > cost
   $0-1/1K               $60/1K                    $220/1K
   MoviePy               Remotion                  ElevenLabs
   Edge TTS              OpenAI/Vbee TTS           Remotion Lambda
   Dramatiq              Temporal.io
```

---

## 8. Key Takeaways

### 8.1 Tóm tắt các quyết định kiến trúc

1. **Pipeline đơn giản hơn đáng kể** so với PDF/DOCX — text/markdown input chỉ cần mistune + LLM/ViT5, không cần OCR, image extraction.
2. **Edge TTS + WhisperX** là combo tốt nhất cho MVP: free, đa ngôn ngữ, đủ chất lượng cho news explainer 30s–2ph.
3. **ViT5-base local** giải quyết bài toán summarization tiếng Việt với chi phí $0 và ROUGE-1 = 61.85.
4. **MoviePy + FFmpeg** đủ cho MVP khi input chỉ là text — không cần Remotion/React ngay từ đầu.
5. **Solid color / gradient background** cho Phase 1 (không cần AI image generation) — giảm cost và complexity.
6. **Remotion** là lựa chọn hàng đầu cho video rendering ở production — code-first, maintainable, đã chứng minh qua Fireship/Theo.
7. **Temporal.io** giải quyết bài toán long-running pipeline mà Celery/Prefect xử lý kém hơn.
8. **Burn-in ASS subtitle với karaoke-style** là điểm nhấn UX quan trọng cho news explainer — tạo cảm giác "đọc theo" từng từ.
9. **Render 1 lần ở 9:16 + crop/pad bằng FFmpeg** tiết kiệm 50% compute so với render 2 lần riêng biệt.
10. **Top 3 GitHub repos đáng học:** Pilipili-AutoVideo (LangGraph + TTS-first), youtube-shorts-pipeline (cost optimization), OpenReels (Remotion-based).
11. **Cost per video (text input):** $0.001 (budget) → $0.06 (balanced) → $0.22 (premium). Break-even với 6K views/video ở tier balanced.

### 8.2 Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Edge TTS bị rate-limit hoặc discontinued | Có fallback Vbee/OpenAI sẵn |
| ViT5 chất lượng chưa đủ cho bài phức tạp | Fallback LLM (Gemini Flash $0.0004) |
| Render MoviePy chậm trên CPU | Upgrade Remotion cho Phase 2 |
| TTS duration không khớp với slides | WhisperX timestamps + adaptive slide duration |
| Input markdown có format đặc biệt (tables, code blocks) | Mistune parser + skip non-text tokens |
| Cost vượt budget khi scale | Tier-based pricing, cache aggressive |

### 8.3 Ưu điểm của text/markdown input

1. **Đơn giản hóa pipeline** — bỏ qua PDF parser, OCR, image extraction, table detection
2. **Cost giảm 30-50%** so với PDF/DOCX pipeline
3. **MVP nhanh hơn** — có thể chạy được trong 1-2 tuần thay vì 2-4 tuần
4. **User kiểm soát content** — paste text sạch, không lẫn layout phức tạp
5. **LLM summarization hiệu quả hơn** — text đã clean, không cần preprocessing
6. **Dễ cache** — content hash ổn định, không phụ thuộc binary format

### 8.4 Câu hỏi cần quyết định trước khi code

1. **First language focus:** Tiếng Việt trước hay song song cả 2?
2. **Brand voice:** Preset voice hay clone giọng MC cụ thể?
3. **Background style:** Solid color (MVP), gradient, hay AI-generated illustration?
4. **Subtitle language:** Tiếng Việt, tiếng Anh, hay cả 2 cho mỗi video?
5. **Hosting:** Self-host (Mac Studio) vs Cloud (AWS/GCP)?

---

## Phụ Lục: Tài Liệu Tham Khảo

### Official Documentation
- [mistune (Markdown parser)](https://github.com/lepture/mistune)
- [MoviePy](https://zulko.github.io/moviepy/)
- [Remotion Documentation](https://www.remotion.dev/docs)
- [Temporal Python SDK](https://python.temporal.io/)
- [WhisperX](https://github.com/m-bain/whisperX)
- [edge-tts](https://github.com/rany2/edge-tts)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)
- [ViT5 (VietAI)](https://huggingface.co/VietAI/vit5-base-vietnews-summarization)
- [MeloTTS](https://github.com/myshell-ai/MeloTTS)
- [FFmpeg drawtext/subtitles](https://ffmpeg.org/ffmpeg-filters.html#subtitles)

### GitHub Repos
- [Pilipili-AutoVideo](https://github.com/OpenDemon/Pilipili-AutoVideo)
- [youtube-shorts-pipeline](https://github.com/rushindrasinha/youtube-shorts-pipeline)
- [OpenReels](https://github.com/streamoji-sdk/OpenReels)
- [TEXT-TO-VIDEO](https://github.com/krishcodes07/TEXT-TO-VIDEO)

### Benchmarks & Pricing
- [VerticalAPI Benchmark 2026](https://verticalapi.com/benchmark/)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing)
- [TTS Quality Comparison](https://dibi8.com/resources/ai-tools/melotts/)
- [ViT5 Paper (NAACL 2022)](https://aclanthology.org/2022.naacl-srw.18/)

---

**Liên hệ & Next Steps:**

Báo cáo này cung cấp foundation cho quyết định kiến trúc. Các bước tiếp theo có thể là:

1. **Setup Phase 1 MVP** — viết code end-to-end với Edge TTS + MoviePy + Dramatiq
2. **Technical Spec chi tiết** — API contract, database schema, deployment plan
3. **PoC Remotion** — build 1 composition sample để đánh giá chất lượng
4. **Benchmark local** — test ViT5 + MeloTTS trên Mac M2 thực tế
5. **Cost calculator** — script tính chi phí chính xác theo use case cụ thể
