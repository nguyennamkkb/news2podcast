"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen p-8 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{this.state.error?.message}</AlertDescription>
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </Alert>
        </main>
      );
    }
    return this.props.children;
  }
}
