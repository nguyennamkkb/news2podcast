"""End-to-end pipeline test. Run: python backend/scripts/test_pipeline.py"""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.temporal.activities.parse_content import parse_content
from app.temporal.activities.generate_script import generate_script
from app.temporal.activities.generate_tts import generate_tts
from app.temporal.activities.render_video import render_video
from app.temporal.activities.convert_format import convert_9x16_to_16x9


SAMPLE_ARTICLE = """# Tin tức công nghệ tuần này

## Trí tuệ nhân tạo tiếp tục phát triển

Các công ty công nghệ lớn đang đầu tư hàng tỷ đô la vào nghiên cứu AI. OpenAI vừa công bố mô hình mới với khả năng suy luận vượt trội.

## Thị trường chip bán dẫn sôi động

NVIDIA tiếp tục dẫn đầu với doanh thu kỷ lục từ chip AI. AMD và Intel đang nỗ lực bắt kịp với các sản phẩm mới.

## Xu hướng công nghệ 2026

Công nghệ lượng tử đang tiến gần hơn tới ứng dụng thực tế. Xe tự lái cấp độ 4 bắt đầu được triển khai thương mại.
"""


async def main():
    Path("temp").mkdir(exist_ok=True)

    print("📄 [1/4] Parsing content...")
    parsed = parse_content(SAMPLE_ARTICLE)
    print(f"   Title: {parsed['title']}, Words: {parsed['word_count']}")

    print("🤖 [2/4] Generating slide script (Ollama)...")
    config = {"slide_count": 4, "target_duration_sec": 60}
    slides_data = generate_script(parsed, config)
    print(f"   Generated {len(slides_data['slides'])} slides")

    print("🎤 [3/4] Generating TTS (Edge)...")
    for i, slide in enumerate(slides_data["slides"]):
        output_path = f"temp/slide_{i+1}.mp3"
        result = await generate_tts(slide["voiceover"], "vi-VN-HoaiMyNeural", output_path)
        slide["audioPath"] = output_path
        slide["duration"] = result["duration_ms"] / 1000
        print(f"   Slide {i+1}: {slide['title']} ({result['duration_ms']}ms)")

    print("🎬 [4/4] Rendering + converting...")
    render_result = render_video(slides_data["slides"], "temp/test_9x16.mp4")
    print(f"   9x16: {render_result['size_bytes']:,} bytes")

    convert_result = convert_9x16_to_16x9("temp/test_9x16.mp4", "temp/test_16x9.mp4")
    print(f"   16x9: {convert_result['size_bytes']:,} bytes")

    print("\n✅ Pipeline complete!")
    print(f"   9x16: temp/test_9x16.mp4")
    print(f"   16x9: temp/test_16x9.mp4")


if __name__ == "__main__":
    asyncio.run(main())