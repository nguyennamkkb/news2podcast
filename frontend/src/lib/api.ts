const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createJob(content: string, config: Record<string, unknown>) {
  return apiFetch('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify({ content, config }),
  });
}

export async function getJobStatus(jobId: string) {
  return apiFetch(`/api/v1/jobs/${jobId}`);
}

export async function listVideos(page = 1) {
  return apiFetch(`/api/v1/videos?page=${page}`);
}