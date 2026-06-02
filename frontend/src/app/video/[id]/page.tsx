"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTracker } from "@/components/ProgressTracker";
import { useEffect, useState } from "react";

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => { setVideoData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="min-h-screen p-8 flex items-center justify-center"><p className="text-gray-400">Loading...</p></main>;

  const isDone = videoData?.status === "completed";
  const isProcessing = videoData?.status === "queued" || videoData?.status === "processing";

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">← Back</Link>

        {isProcessing && <ProgressTracker jobId={id} />}

        {isDone && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-bg-secondary border-border">
              <CardContent className="p-4">
                <video src={videoData?.video?.downloads?.["9x16"]?.url} controls className="w-full rounded-lg" poster={videoData?.video?.thumbnail_url} />
              </CardContent>
            </Card>
            <Card className="bg-bg-secondary border-border">
              <CardContent className="p-4">
                <video src={videoData?.video?.downloads?.["16x9"]?.url} controls className="w-full rounded-lg" poster={videoData?.video?.thumbnail_url} />
              </CardContent>
            </Card>
            <Card className="bg-bg-secondary border-border col-span-2">
              <CardHeader><CardTitle>{videoData?.video?.title || "Video"}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-400">Slides: {videoData?.video?.slide_count} | Duration: {Math.round(videoData?.video?.duration_sec)}s</p>
                <div className="flex gap-3">
                  <Button asChild><a href={videoData?.video?.downloads?.["9x16"]?.url} download>⬇ 9:16</a></Button>
                  <Button asChild><a href={videoData?.video?.downloads?.["16x9"]?.url} download>⬇ 16:9</a></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {videoData?.status === "failed" && (
          <Card className="bg-bg-secondary border-red-500">
            <CardContent className="p-6 text-center">
              <p className="text-red-400 text-lg mb-4">❌ Generation failed</p>
              <p className="text-gray-400 mb-4">{videoData?.error_message}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}