"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateVideo } from "@/hooks/useGenerateVideo";
import { useSettings } from "@/hooks/useSettings";
import { ContentEditor } from "@/components/ContentEditor";
import { ConfigPanel } from "@/components/ConfigPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-2xl font-display font-black">New Video</h1>
          <div className="w-16" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="float-right hover:text-white">&times;</button>
          </div>
        )}

        <Card className="bg-bg-secondary border-border mb-6">
          <CardHeader><CardTitle>Content</CardTitle></CardHeader>
          <CardContent>
            <ContentEditor
              value={content}
              onChange={setContent}
              wordCount={wordCount}
              language={language}
            />
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-6">
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
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

        <Button
          size="lg"
          className="w-full bg-accent-blue hover:bg-accent-blue/80"
          onClick={handleSubmit}
          disabled={isPending || wordCount < 10}
        >
          {isPending ? "⚡ Generating..." : "⚡ Generate Video"}
        </Button>
      </div>
    </main>
  );
}