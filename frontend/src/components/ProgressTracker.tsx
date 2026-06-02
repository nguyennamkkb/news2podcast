"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Step {
  name: string;
  displayName: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  duration_ms: number | null;
}

const STEP_NAMES: Record<string, string> = {
  parsing: "Parsing content",
  scripting: "Generating slide script",
  tts: "Creating voiceover",
  aligning: "Aligning words",
  rendering: "Rendering video",
  converting: "Converting format",
  mixing: "Mixing audio",
  uploading: "Uploading video",
  saving: "Saving result",
};

const STATUS_MAP: Record<string, Step["status"]> = {
  running: "in_progress",
  done: "completed",
};

const STATUS_BADGE_VARIANT: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  failed: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Done",
  failed: "Failed",
};

function StepBadge({ status }: { status: string }) {
  const variant = STATUS_BADGE_VARIANT[status] || "outline";
  return <Badge variant={variant}>{STATUS_LABEL[status] || status}</Badge>;
}

export function ProgressTracker({ jobId }: { jobId: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/api/v1/ws/jobs/${jobId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPercent(data.percent || 0);
      if (data.steps) setSteps(data.steps);
      if (data.status === "completed" || data.status === "failed") ws.close();
    };
    return () => ws.close();
  }, [jobId]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold mb-2">Generating your video</h2>
        <Progress value={percent} className="h-3 mb-2" />
        <p className="text-sm text-muted-foreground">{percent}%</p>
      </div>
      <Tabs defaultValue="steps" orientation="vertical" className="w-full">
        <TabsList variant="line" className="w-full">
          {steps.map((step, i) => {
            const status = STATUS_MAP[step.status] || step.status;
            return (
              <TabsTrigger key={i} value={step.name} className="flex items-center gap-2">
                <StepBadge status={status} />
                <span className="hidden sm:inline text-xs truncate">{STEP_NAMES[step.name] || step.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {steps.map((step, i) => {
          const status = STATUS_MAP[step.status] || step.status;
          return (
            <TabsContent key={i} value={step.name} className="p-3 rounded-md bg-secondary/50">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{STEP_NAMES[step.name] || step.name}</span>
                <StepBadge status={status} />
              </div>
              {step.duration_ms != null && (
                <p className="text-sm text-muted-foreground mt-1">Duration: {(step.duration_ms / 1000).toFixed(1)}s</p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}