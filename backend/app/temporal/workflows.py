from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy


with workflow.unsafe.imports_passed():
    pass


@workflow.defn
class NewsToVideoWorkflow:
    @workflow.run
    async def run(self, job_input: dict) -> dict:
        job_id = job_input["job_id"]
        steps = [
            {"name": "parsing", "status": "pending"},
            {"name": "scripting", "status": "pending"},
            {"name": "tts", "status": "pending"},
            {"name": "rendering", "status": "pending"},
            {"name": "converting", "status": "pending"},
            {"name": "uploading", "status": "pending"},
            {"name": "saving", "status": "pending"},
        ]

        try:
            steps[0]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "parsing", 5, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            parsed = await workflow.execute_activity(
                "parse_content",
                job_input["content"],
                start_to_close_timeout=timedelta(seconds=10),
                retry_policy=RetryPolicy(maximum_attempts=3),
            )
            workflow.logger.info(f"Parsed: {parsed['word_count']} words")

            steps[0]["status"] = "done"
            steps[1]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "scripting", 10, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            slides_data = await workflow.execute_activity(
                "generate_script",
                {"content": parsed, "config": job_input["config"]},
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            workflow.logger.info(f"Generated {len(slides_data['slides'])} slides")

            steps[1]["status"] = "done"
            steps[2]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "tts", 30, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

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

            steps[2]["status"] = "done"
            steps[3]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "rendering", 50, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            render_result = await workflow.execute_activity(
                "render_video",
                {"slides_data": slides_data["slides"], "output_path": "temp/output_9x16.mp4"},
                start_to_close_timeout=timedelta(seconds=180),
                heartbeat_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            workflow.logger.info(f"Video rendered: {render_result['size_bytes']} bytes")

            steps[3]["status"] = "done"
            steps[4]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "converting", 80, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            convert_result = await workflow.execute_activity(
                "convert_9x16_to_16x9",
                {"input_path": "temp/output_9x16.mp4", "output_path": "temp/output_16x9.mp4"},
                start_to_close_timeout=timedelta(seconds=60),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            workflow.logger.info("Format conversion complete")

            steps[4]["status"] = "done"
            steps[5]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "uploading", 95, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            upload_result = await workflow.execute_activity(
                "upload_storage",
                args=[render_result["output_path"], convert_result["output_path"], job_id],
                start_to_close_timeout=timedelta(seconds=120),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )

            steps[5]["status"] = "done"
            steps[6]["status"] = "running"
            await workflow.execute_activity(
                "update_progress",
                args=[job_id, "saving", 98, steps],
                start_to_close_timeout=timedelta(seconds=5),
            )

            title = slides_data["slides"][0]["title"] if slides_data["slides"] else "Video"
            total_duration = sum(s.get("duration", 0) for s in slides_data["slides"])
            language = job_input["config"].get("language", parsed.get("detected_lang", "vi"))

            save_result_data = await workflow.execute_activity(
                "save_result",
                args=[
                    job_id,
                    title,
                    total_duration,
                    len(slides_data["slides"]),
                    language,
                    upload_result["url_9x16"],
                    upload_result["size_9x16"],
                    upload_result["url_16x9"],
                    upload_result["size_16x9"],
                    slides_data,
                ],
                start_to_close_timeout=timedelta(seconds=10),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )

            steps[6]["status"] = "done"
            video_data = {
                "video_id": save_result_data["video_id"],
                "title": title,
                "duration_sec": total_duration,
                "slide_count": len(slides_data["slides"]),
                "url_9x16": upload_result["url_9x16"],
                "url_16x9": upload_result["url_16x9"],
            }

            await workflow.execute_activity(
                "mark_job_completed",
                args=[job_id, video_data],
                start_to_close_timeout=timedelta(seconds=5),
            )

            return {
                "video_id": save_result_data["video_id"],
                "title": title,
                "slide_count": len(slides_data["slides"]),
                "duration_sec": total_duration,
                "url_9x16": upload_result["url_9x16"],
                "url_16x9": upload_result["url_16x9"],
            }

        except Exception as e:
            workflow.logger.error(f"Workflow failed: {e}")
            await workflow.execute_activity(
                "mark_job_failed",
                args=[job_id, str(e), True],
                start_to_close_timeout=timedelta(seconds=5),
            )
            raise