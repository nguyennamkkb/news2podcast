import edge_tts
import asyncio
import subprocess
from pathlib import Path


async def generate_tts(text: str, voice: str, output_path: str) -> dict:
    """Generate TTS audio using Microsoft Edge TTS (free)."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    duration_ms = get_audio_duration_ms(output_path)
    return {"audio_path": output_path, "duration_ms": duration_ms}


def get_audio_duration_ms(audio_path: str) -> int:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audio_path],
        capture_output=True, text=True, check=True,
    )
    return int(float(result.stdout.strip()) * 1000)