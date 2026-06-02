import type {
  VideoConfig,
  JobResponse,
  JobDetailResponse,
  VideoListResponse,
  VideoDetail,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function createJob(content: string, config: VideoConfig): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/api/v1/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, config }),
  });
  if (!res.ok) throw new Error(`Failed to create job: ${res.statusText}`);
  return res.json();
}

export async function getJob(jobId: string): Promise<JobDetailResponse> {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`);
  if (!res.ok) throw new Error(`Failed to get job: ${res.statusText}`);
  return res.json();
}

export async function listVideos(page = 1, pageSize = 20, status?: string): Promise<VideoListResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set('status', status);
  const res = await fetch(`${API_BASE}/api/v1/videos?${params}`);
  if (!res.ok) throw new Error(`Failed to list videos: ${res.statusText}`);
  return res.json();
}

export async function getVideo(videoId: string): Promise<VideoDetail> {
  const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}`);
  if (!res.ok) throw new Error(`Failed to get video: ${res.statusText}`);
  return res.json();
}

export function getDownloadUrl(videoId: string, format: '9x16' | '16x9'): string {
  return `${API_BASE}/api/v1/videos/${videoId}/download?format=${format}`;
}