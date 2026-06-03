'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGenerateVideo } from "@/hooks/useGenerateVideo";
import { useSettings } from "@/hooks/useSettings";
import { ContentEditor } from "@/components/ContentEditor";
import { ConfigPanel } from "@/components/ConfigPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { WandSparkles, Cloud } from "lucide-react";
import type { VideoConfig, LLMConfig } from "@/lib/types";

export default function NewVideoPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();

  const [content, setContent] = useState("");
  const [voice, setVoice] = useState("vi-VN-HoaiMyNeural");
  const [format, setFormat] = useState<"9x16" | "16x9">("9x16");
  const [targetDuration, setTargetDuration] = useState<number | "auto">("auto");
  const [slideCount, setSlideCount] = useState(5);
  const [backgroundMusic, setBackgroundMusic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: generateVideo, isPending } = useGenerateVideo();

  useEffect(() => {
    if (settingsLoading) return;
    setVoice(settings.defaultVoice);
    setFormat(settings.defaultFormat);
    setSlideCount(settings.defaultSlideCount);
    setTargetDuration(settings.defaultTargetDuration);
  }, [settingsLoading, settings]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const language = content.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i) ? "Vietnamese" : "English";

  const handleSubmit = useCallback(() => {
    if (wordCount < 10) return;
    setError(null);

    const config: VideoConfig = {
      voice,
      format,
      outputs: ["9x16", "16x9"],
      target_duration_sec: targetDuration === "auto" ? 60 : targetDuration,
      slide_count: slideCount,
      background_music: backgroundMusic,
    };

    const llm_config: LLMConfig | undefined = (() => {
      const provider = settings.llmProvider;
      if (provider === 'ollama') {
        const url = settings.ollamaApiUrl;
        const model = settings.ollamaModel;
        if (!url && !model) return undefined;
        return { provider: 'ollama', api_url: url, model: model || 'qwen3:32b' };
      }
      return {
        provider: 'openai',
        api_url: settings.llmApiUrl,
        api_key: settings.llmApiKey || undefined,
        model: settings.llmModel || 'gpt-4o-mini',
      };
    })();

    generateVideo(
      { content, config, ...(llm_config ? { llm_config } : {}) },
      {
        onSuccess: (data) => {
          router.push(`/video/${data.job_id}`);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to create job. Please try again.");
        },
      },
    );
  }, [content, voice, format, targetDuration, slideCount, backgroundMusic, wordCount, settings, generateVideo, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <>
      <PageHeader />

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-destructive">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="float-right text-muted-foreground hover:text-foreground h-auto p-0"
              >
                <span className="sr-only">Dismiss</span>
                &times;
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentEditor
                  value={content}
                  onChange={setContent}
                  wordCount={wordCount}
                  language={language}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfigPanel
                  config={{ voice, format, targetDuration, slideCount, backgroundMusic }}
                  onChange={(partial) => {
                    if (partial.voice !== undefined) setVoice(partial.voice);
                    if (partial.format !== undefined) setFormat(partial.format);
                    if (partial.targetDuration !== undefined) setTargetDuration(partial.targetDuration);
                    if (partial.slideCount !== undefined) setSlideCount(partial.slideCount);
                    if (partial.backgroundMusic !== undefined) setBackgroundMusic(partial.backgroundMusic);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-medium flex items-center gap-2">
                <Cloud className="size-4 text-muted-foreground" />
                LLM Provider
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {settings.llmProvider === 'ollama' ? 'Ollama' : 'OpenAI-compatible'} · {settings.llmProvider === 'ollama' ? (settings.ollamaModel || 'qwen3:32b') : (settings.llmModel || 'gpt-4o-mini')}
                </span>
                <span className="text-xs text-muted-foreground">Configure in Settings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button size="lg" className="flex-1" onClick={handleSubmit} disabled={isPending || wordCount < 10}>
            <WandSparkles className="mr-2 size-4" />
            {isPending ? "Generating Script..." : "Generate Script"}
            <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">⌘↵</kbd>
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Cloud className="size-3.5" />
            {settings.llmProvider === 'ollama' ? 'Ollama' : 'OpenAI'}
          </span>
        </div>
      </main>
    </>
  );
}