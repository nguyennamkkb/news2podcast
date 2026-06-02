'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateVideo } from "@/hooks/useGenerateVideo";
import { useSettings } from "@/hooks/useSettings";
import { ContentEditor } from "@/components/ContentEditor";
import { ConfigPanel } from "@/components/ConfigPanel";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { WandSparkles } from "lucide-react";
import type { VideoConfig } from "@/lib/types";

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

  const handleSubmit = () => {
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

    generateVideo(
      { content, config },
      {
        onSuccess: (data) => {
          router.push(`/video/${data.job_id}`);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to create job. Please try again.");
        },
      },
    );
  };

  return (
    <>
      <PageHeader />

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
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

          <Card className="mb-6">
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

          <Card className="mb-6">
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

          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={isPending || wordCount < 10}>
            <WandSparkles className="mr-2 size-4" />
            {isPending ? "Generating..." : "Generate Video"}
          </Button>
        </div>
      </main>
    </>
  );
}
