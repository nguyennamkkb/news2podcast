import json
import subprocess
from pathlib import Path

REMOTION_PROJECT_DIR = Path(__file__).parent.parent.parent.parent.parent / "remotion"


def render_video(slides_data: list, output_path: str) -> dict:
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    props_path = output.parent / f"{output.stem}_props.json"
    props = {"slides": slides_data}
    props_path.write_text(json.dumps(props, ensure_ascii=False))

    cmd = [
        "npx", "remotion", "render",
        "NewsVideo",
        f"--props={props_path}",
        f"--output={output}",
        "--codec=h264",
        "--quality=100",
        "--concurrency=4",
    ]
    result = subprocess.run(cmd, cwd=REMOTION_PROJECT_DIR, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"Remotion render failed:\n{result.stderr[-500:]}")
    return {"output_path": str(output), "size_bytes": output.stat().st_size}