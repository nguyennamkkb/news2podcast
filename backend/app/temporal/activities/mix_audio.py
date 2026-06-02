import subprocess
from pathlib import Path
from temporalio import activity


@activity.defn
def mix_audio(voice_path: str, bgm_path: str, output_path: str, bgm_volume_db: float = -20.0) -> dict:
    """Mix voiceover with background music. Voice stays at original volume, BGM lowered."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    if not Path(bgm_path).exists():
        import shutil
        shutil.copy(voice_path, output_path)
        return {"output_path": output_path, "mixed": False}

    cmd = [
        "ffmpeg", "-i", voice_path, "-i", bgm_path,
        "-filter_complex",
        f"[1:a]volume={bgm_volume_db}dB[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]",
        "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2",
        output_path, "-y",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"Audio mix failed: {result.stderr[-300:]}")

    return {"output_path": output_path, "mixed": True}