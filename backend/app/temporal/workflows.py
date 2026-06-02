from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy


@workflow.defn
class NewsToVideoWorkflow:
    @workflow.run
    async def run(self, job_input: dict) -> dict:
        parsed = await workflow.execute_activity(
            "parse_content",
            job_input["content"],
            start_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(maximum_attempts=3),
        )
        workflow.logger.info(f"Parsed: {parsed['word_count']} words")

        slides_data = await workflow.execute_activity(
            "generate_script",
            {"content": parsed, "config": job_input["config"]},
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=2),
        )
        workflow.logger.info(f"Generated {len(slides_data['slides'])} slides")

        for i, slide in enumerate(slides_data["slides"]):
            output_path = f"temp/slide_{i+1}.mp3"
            tts_result = await workflow.execute_activity(
                "generate_tts",
                {"text": slide["voiceover"], "voice": job_input["config"]["voice"], "output_path": output_path},
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=3),
            )
            slides_data["slides"][i]["audioPath"] = output_path
            slides_data["slides"][i]["duration"] = tts_result["duration_ms"] / 1000

        workflow.logger.info("TTS generation complete")

        render_result = await workflow.execute_activity(
            "render_video",
            {"slides_data": slides_data["slides"], "output_path": "temp/output_9x16.mp4"},
            start_to_close_timeout=timedelta(seconds=180),
            heartbeat_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=2),
        )
        workflow.logger.info(f"Video rendered: {render_result['size_bytes']} bytes")

        convert_result = await workflow.execute_activity(
            "convert_9x16_to_16x9",
            {"input_path": "temp/output_9x16.mp4", "output_path": "temp/output_16x9.mp4"},
            start_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(maximum_attempts=2),
        )
        workflow.logger.info("Format conversion complete")

        title = slides_data["slides"][0]["title"] if slides_data["slides"] else "Video"
        return {
            "video_9x16": render_result["output_path"],
            "video_16x9": convert_result["output_path"],
            "slide_count": len(slides_data["slides"]),
            "title": title,
        }