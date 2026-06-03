'use client';

import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/hooks/useSettings';
import { testLLMConnection } from '@/lib/api';
import type { LLMConfig } from '@/lib/types';

export interface LLMStatus {
  provider: string;
  model: string;
  connected: boolean;
  latencyMs: number | null;
}

export function useLLMStatus() {
  const { settings } = useSettings();

  const config: LLMConfig = settings.llmProvider === 'ollama'
    ? { provider: 'ollama', api_url: settings.ollamaApiUrl, model: settings.ollamaModel }
    : { provider: 'openai', api_url: settings.llmApiUrl, api_key: settings.llmApiKey || undefined, model: settings.llmModel };

  const query = useQuery({
    queryKey: ['llm-status', config.provider, config.api_url, config.model],
    queryFn: async (): Promise<LLMStatus> => {
      try {
        const result = await testLLMConnection(config);
        return {
          provider: config.provider === 'ollama' ? 'Ollama' : 'OpenAI',
          model: config.model,
          connected: result.success,
          latencyMs: result.latency_ms,
        };
      } catch {
        return {
          provider: config.provider === 'ollama' ? 'Ollama' : 'OpenAI',
          model: config.model,
          connected: false,
          latencyMs: null,
        };
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  return {
    status: query.data ?? { provider: config.provider === 'ollama' ? 'Ollama' : 'OpenAI', model: config.model, connected: false, latencyMs: null },
    isLoading: query.isLoading,
  };
}