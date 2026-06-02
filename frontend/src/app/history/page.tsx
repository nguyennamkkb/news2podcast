"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoItem {
  video_id: string;
  title: string;
  status: string;
  duration_sec: number | null;
  slide_count: number | null;
  created_at: string;
  download_9x16: string | null;
  download_16x9: string | null;
}

export default function HistoryPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/videos")
      .then((r) => r.json())
      .then((data) => { setVideos(data.videos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-display font-black">History</h1>
          <div className="w-16" />
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading...</p>
        ) : videos.length === 0 ? (
          <Card className="bg-bg-secondary border-border">
            <CardContent className="py-12 text-center text-gray-400">
              No videos yet. <Link href="/new" className="text-accent-blue hover:underline">Create your first video</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-border">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.video_id} className="border-b border-border hover:bg-bg-tertiary/50">
                    <td className="py-3 px-4">
                      {v.status === "completed" ? "✅" : v.status === "processing" ? "🔄" : v.status === "failed" ? "❌" : "⏳"}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/video/${v.video_id}`} className="hover:text-accent-blue">{v.title || "Untitled"}</Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{v.duration_sec ? `${Math.round(v.duration_sec)}s` : "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {v.download_9x16 && <Button size="sm" asChild variant="outline"><a href={v.download_9x16} download>⬇</a></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}