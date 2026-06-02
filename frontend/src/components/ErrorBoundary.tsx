"use client";

import { Component, ReactNode } from "react";
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
          <div className="text-center max-w-md">
            <p className="text-6xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4 text-sm">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}