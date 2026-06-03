'use client';

import { useLLMStatus } from '@/hooks/useLLMStatus';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';

export function LLMStatusBadge() {
  const { status, isLoading } = useLLMStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Checking...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.connected ? 'default' : 'destructive'} className="gap-1 text-xs">
        {status.connected ? <Cloud className="size-3" /> : <CloudOff className="size-3" />}
        {status.provider}
      </Badge>
      <span className="text-xs text-muted-foreground">{status.model}</span>
      {status.latencyMs !== null && status.connected && (
        <span className="text-xs text-muted-foreground">{status.latencyMs}ms</span>
      )}
    </div>
  );
}