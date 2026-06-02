/**
 * Types mirrored from shared/types.ts for frontend use.
 * The workspace shared/ package is not in the tsconfig paths,
 * so we copy the needed types here.
 */

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ProgressStep {
  name: string;
  status: StepStatus;
  duration_ms: number | null;
}

export interface JobProgress {
  current_step: string;
  percent: number;
  steps: ProgressStep[];
}

export interface VideoConfig {
  voice: string;
  format: '9x16' | '16x9';
  outputs: ('9x16' | '16x9')[];
  target_duration_sec: number;
  slide_count: number;
  background_music: string | null;
}

export interface CreateJobRequest {
  content: string;
  config: VideoConfig;
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  created_at: string;
  estimated_duration_sec?: number;
}

export interface VideoOutput {
  video_id: string;
  title: string;
  duration_sec: number;
  slide_count: number;
  downloads: {
    '9x16'?: { url: string; size_bytes: number; expires_at: string };
    '16x9'?: { url: string; size_bytes: number; expires_at: string };
  };
}

export interface JobDetailResponse {
  job_id: string;
  status: JobStatus;
  progress: JobProgress | null;
  video: VideoOutput | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface VideoListItem {
  video_id: string;
  job_id: string;
  title: string;
  status: JobStatus;
  duration_sec: number;
  created_at: string;
}

export interface VideoListPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface VideoListResponse {
  videos: VideoListItem[];
  pagination: VideoListPagination;
}

export interface VideoDetail {
  video_id: string;
  job_id: string;
  title: string;
  status: JobStatus;
  duration_sec: number;
  slide_count: number;
  created_at: string;
  updated_at: string;
  downloads: {
    '9x16'?: { url: string; size_bytes: number; expires_at: string };
    '16x9'?: { url: string; size_bytes: number; expires_at: string };
  };
}