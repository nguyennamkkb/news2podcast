'use client';

import { useMutation } from '@tanstack/react-query';
import { createJob } from '@/lib/api';
import type { VideoConfig, LLMConfig, JobResponse } from '@/lib/types';

export function useGenerateVideo() {
  return useMutation<JobResponse, Error, { content: string; config: VideoConfig; llm_config?: LLMConfig }>({
    mutationFn: ({ content, config, llm_config }) => createJob(content, config, llm_config),
  });
}