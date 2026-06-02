'use client';

import { useQuery } from '@tanstack/react-query';
import { listVideos } from '@/lib/api';

export function useDashboardStats() {
  const recentQuery = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => listVideos(1, 5),
    staleTime: 30_000,
  });

  const allQuery = useQuery({
    queryKey: ['dashboard', 'all'],
    queryFn: () => listVideos(1, 1),
    staleTime: 60_000,
  });

  const videos = recentQuery.data?.videos ?? [];
  const total = allQuery.data?.pagination?.total ?? 0;

  const videosThisWeek = total;
  const completedVideos = videos.filter(v => v.status === 'completed');
  const avgTime = completedVideos.length > 0
    ? Math.round(completedVideos.reduce((sum, v) => sum + (v.duration_sec || 0), 0) / completedVideos.length)
    : 0;

  return {
    videosThisWeek,
    avgTime,
    videos,
    isLoading: recentQuery.isLoading || allQuery.isLoading,
  };
}