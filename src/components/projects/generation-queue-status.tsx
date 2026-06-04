"use client";

import { useQueueStatus } from "@/hooks/use-queue-status";
import type { QueueStatus } from "@/hooks/use-queue-status";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function Slot({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "h-3 w-3 rounded-sm border",
        active
          ? "bg-blue-500 border-blue-600"
          : "bg-gray-100 border-gray-200"
      )}
    />
  );
}

export function GenerationQueueStatus() {
  const { data } = useQueueStatus();

  if (!data || data.activeCount === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap
            className={cn(
              "h-4 w-4",
              data.slotAvailable ? "text-blue-600" : "text-red-600"
            )}
          />
          <span className="font-medium text-sm">Generation Slots</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: data.maxConcurrent }).map((_, i) => (
            <Slot key={i} active={i < data.activeCount} />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {data.activeCount}/{data.maxConcurrent} slots in use
          </span>
        </div>
        {data.queueLength > 0 && (
          <p className="mt-1 text-xs text-yellow-600">
            Queue: {data.queueLength} project{data.queueLength > 1 ? "s" : ""} waiting
          </p>
        )}
      </CardContent>
    </Card>
  );
}