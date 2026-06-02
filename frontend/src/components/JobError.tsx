"use client";

import { Button } from "@/components/ui/button";

interface JobErrorProps {
  errorMessage: string | null;
  retryable: boolean;
  onRetry: () => void;
}

export function JobError({ errorMessage, retryable, onRetry }: JobErrorProps) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-4">❌</p>
      <h3 className="text-lg font-bold text-red-400 mb-2">Generation Failed</h3>
      <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">{errorMessage || "An unexpected error occurred. Please try again."}</p>
      {retryable && <Button onClick={onRetry} className="bg-accent-red hover:bg-accent-red/80">Retry Generation</Button>}
      <p className="text-xs text-gray-500 mt-4">If the problem persists, check your Ollama Cloud connection in Settings.</p>
    </div>
  );
}