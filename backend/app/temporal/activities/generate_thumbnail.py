import subprocess
from pathlib import Path


def generate_thumbnail(video_path: str, output_path: str, time_sec: float = 0.5) -> dict:
    """Capture a frame from video as thumbnail."""
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-ss", str(time_sec), "-i", video_path,
        "-vframes", "1", "-q:v", "2",
        "-vf", "scale=540:-1",
        output_path, "-y",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(f"Thumbnail generation failed: {result.stderr[-300:]}")
    return {"thumbnail_path": str(output), "size_bytes": output.stat().st_size}