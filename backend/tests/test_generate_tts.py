import pytest
from pathlib import Path
from app.temporal.activities.generate_tts import generate_tts


@pytest.mark.asyncio
async def test_generate_tts_creates_audio_file(tmp_path):
    output_path = tmp_path / "test.mp3"
    result = await generate_tts(
        text="Hôm nay thị trường chứng khoán tăng điểm mạnh.",
        voice="vi-VN-HoaiMyNeural",
        output_path=str(output_path),
    )
    assert Path(output_path).exists()
    assert Path(output_path).stat().st_size > 0
    assert result["duration_ms"] > 0
    assert result["duration_ms"] < 30000