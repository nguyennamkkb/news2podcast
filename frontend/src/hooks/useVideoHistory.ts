'use client';

import { useQuery } from '@tanstack/react-query';
import { listVideos } from '@/lib/api';
import type { VideoListResponse } from '@/lib/types';

export function useVideoHistory(page: number = 1, pageSize: number = 20, status?: string) {
  return useQuery<VideoListResponse, Error>({
    queryKey: ['videos', page, pageSize, status],
    queryFn: () => listVideos(page, pageSize, status),
  });
}