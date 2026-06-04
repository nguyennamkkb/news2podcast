"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, RefreshCw } from "lucide-react";
import type { Script } from "@/types/script";

type GenerationStatus =
  | "idle"
  | "queued"
  | "researching"
  | "generating"
  | "validating"
  | "completed"
  | "error";

interface ScriptGeneratePanelProps {
  projectId: string;
  currentStatus: string;
  onGenerateStart: () => void;
  onGenerateComplete: (script: Script) => void;
}

export function ScriptGeneratePanel({
  projectId,
  currentStatus,
  onGenerateStart,
  onGenerateComplete,
}: ScriptGeneratePanelProps) {
  const [genStatus, setGenStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState("");

  const isGenerating = currentStatus === "QUEUED" || currentStatus === "GENERATING";

  useEffect(() => {
    if (currentStatus === "QUEUED") setGenStatus("queued");
    else if (currentStatus === "GENERATING") setGenStatus("researching");
  }, [currentStatus]);

  const handleGenerate = async () => {
    setGenStatus("queued");
    setError(null);
    onGenerateStart();

    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const event = JSON.parse(data);
            if (event.type === "queued") {
              setGenStatus("queued");
              setProgressMessage("Waiting for available slot...");
              setProgress(5);
            } else if (event.type === "researching") {
              setGenStatus("researching");
              setProgressMessage("Researching topic...");
              setProgress(15);
            } else if (event.type === "generating") {
              setGenStatus("generating");
              setProgressMessage("Generating script...");
              setProgress(40);
            } else if (event.type === "validating") {
              setGenStatus("validating");
              setProgressMessage(`Validating output (attempt ${event.attempt})...`);
              setProgress(70);
            } else if (event.type === "completed") {
              setGenStatus("completed");
              setProgress(100);
              setProgressMessage("Done!");
              onGenerateComplete(event.script);
            } else if (event.type === "error") {
              setGenStatus("error");
              setError(event.message);
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      setGenStatus("error");
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  };

  const stepLabels = [
    { key: "queued", label: "Queued", icon: "🕐" },
    { key: "researching", label: "Researching", icon: "🔬" },
    { key: "generating", label: "Generating", icon: "✍️" },
    { key: "validating", label: "Validating", icon: "✅" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        {genStatus === "idle" && !isGenerating && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Ready to generate? Click below to start.
            </p>
            <Button onClick={handleGenerate}>
              <Play className="h-4 w-4 mr-2" />
              Generate Script
            </Button>
          </div>
        )}

        {(genStatus !== "idle" || isGenerating) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {genStatus === "error" ? "❌ Error" : "Generating..."}
              </span>
              {genStatus !== "completed" && genStatus !== "error" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {stepLabels.map((step) => {
                const isActive =
                  stepLabels.findIndex((s) => s.key === genStatus) >=
                  stepLabels.findIndex((s) => s.key === step.key);
                return (
                  <div
                    key={step.key}
                    className={`text-center text-xs p-1.5 rounded ${
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground bg-muted/50"
                    }`}
                  >
                    <div>{step.icon}</div>
                    <div>{step.label}</div>
                  </div>
                );
              })}
            </div>

            <Progress value={progress} />

            <p className="text-xs text-muted-foreground">
              {progressMessage}
            </p>

            {genStatus === "error" && error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Generation failed</p>
                <p className="text-xs">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
