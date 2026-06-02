'use client';

import { useQuery } from '@tanstack/react-query';
import { getJob } from '@/lib/api';
import type { JobDetailResponse } from '@/lib/types';

export function useJobPolling(jobId: string) {
  return useQuery<JobDetailResponse, Error>({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
    enabled: !!jobId,
  });
}