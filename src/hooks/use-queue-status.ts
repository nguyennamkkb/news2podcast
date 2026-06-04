import { useQuery } from "@tanstack/react-query";

export interface QueueStatus {
  activeCount: number;
  queueLength: number;
  maxConcurrent: number;
  slotAvailable: boolean;
}

export function useQueueStatus() {
  return useQuery<QueueStatus>({
    queryKey: ["queue-status"],
    queryFn: async () => {
      const res = await fetch("/api/projects/queue/status");
      if (!res.ok) throw new Error("Failed to fetch queue status");
      return res.json();
    },
    refetchInterval: 3000,
    staleTime: 3000,
  });
}