'use client';

import { useMutation } from '@tanstack/react-query';
import { createJob } from '@/lib/api';
import type { VideoConfig, JobResponse } from '@/lib/types';

export function useGenerateVideo() {
  return useMutation<JobResponse, Error, { content: string; config: VideoConfig }>({
    mutationFn: ({ content, config }) => createJob(content, config),
  });
}