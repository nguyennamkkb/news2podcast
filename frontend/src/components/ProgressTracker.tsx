"use client";

import { useEffect, useState } from "react";

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
};

export function ProgressTracker({ jobId }: { jobId: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/jobs/${jobId}`);
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
        <div className="text-4xl mb-2">📹</div>
        <h2 className="text-xl font-bold mb-2">Generating your video</h2>
        <div className="w-full bg-bg-tertiary rounded-full h-3 mb-2">
          <div className="bg-accent-blue h-3 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-gray-400">{percent}%</p>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span>{step.status === "completed" ? "✅" : step.status === "in_progress" ? "🔄" : step.status === "failed" ? "❌" : "⏳"}</span>
            <span className="flex-1">{STEP_NAMES[step.name] || step.name}</span>
            {step.duration_ms != null && <span className="text-gray-500">({(step.duration_ms / 1000).toFixed(1)}s)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}