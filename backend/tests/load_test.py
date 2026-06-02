"""Load test: submit 20 concurrent video generation jobs."""
import asyncio
import httpx
import time

API = "http://localhost:8000/api/v1/jobs"
TEST_CONTENT = "# Test Article\n\nThis is a test article for load testing the News2Video pipeline.\n\nIt simulates real user behavior."


async def submit_job(client: httpx.AsyncClient, i: int):
    payload = {
        "content": TEST_CONTENT + f"\n\nUnique ID: {i}",
        "config": {
            "voice": "vi-VN-HoaiMyNeural",
            "format": "9x16",
            "outputs": ["9x16"],
            "target_duration_sec": 30,
            "slide_count": 3,
            "background_music": None,
        },
    }
    response = await client.post(API, json=payload)
    return response.status_code, response.json()


async def main():
    print(f"🚀 Load test: 20 concurrent jobs to {API}")
    start = time.time()

    async with httpx.AsyncClient(timeout=10) as client:
        tasks = [submit_job(client, i) for i in range(20)]
        results = await asyncio.gather(*tasks)

    elapsed = time.time() - start
    successes = sum(1 for code, _ in results if code == 202)
    failures = sum(1 for code, _ in results if code != 202)

    print(f"\n{'='*50}")
    print(f"Results: {successes} success / {failures} failures")
    print(f"Time: {elapsed:.2f}s ({elapsed/20:.2f}s per request)")
    print(f"{'='*50}")


if __name__ == "__main__":
    asyncio.run(main())