import subprocess
from pathlib import Path
from temporalio import activity


@activity.defn
def convert_9x16_to_16x9(input_path: str, output_path: str) -> dict:
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-i", input_path,
        "-vf", "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v", "libx264", "-c:a", "copy", "-preset", "fast",
        output_path, "-y",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg conversion failed:\n{result.stderr[-500:]}")
    return {"output_path": str(output), "size_bytes": output.stat().st_size}