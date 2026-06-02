"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface JobErrorProps {
  errorMessage: string | null;
  retryable: boolean;
  onRetry: () => void;
}

export function JobError({ errorMessage, retryable, onRetry }: JobErrorProps) {
  return (
    <div className="py-12">
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertTitle>Generation Failed</AlertTitle>
        <AlertDescription>
          {errorMessage || "An unexpected error occurred. Please try again."}
        </AlertDescription>
        {retryable && (
          <div className="mt-4">
            <Button onClick={onRetry}>Retry Generation</Button>
          </div>
        )}
      </Alert>
      <p className="text-xs text-muted-foreground mt-4 text-center">If the problem persists, check your Ollama Cloud connection in Settings.</p>
    </div>
  );
}
