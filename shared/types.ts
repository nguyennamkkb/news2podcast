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

export interface SlideData {
  title: string;
  bullets: string[];
  voiceover: string;
  audioPath: string;
  duration: number;
  wordTimings: Array<{ word: string; start: number; end: number }>;
  bgColor?: string;
}