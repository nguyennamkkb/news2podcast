'use client';

import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { RecentVideoRow } from "@/components/RecentVideoRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { videosThisWeek, avgTime, videos, isLoading } = useDashboardStats();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-black">News2Video</h1>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm">⚙️ Settings</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Videos this week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? '...' : videosThisWeek}</p>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Avg time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? '...' : avgTime > 0 ? `${Math.floor(avgTime / 60)}m ${avgTime % 60}s` : '—'}</p>
            </CardContent>
          </Card>
          <Card className="bg-bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">~$0.00</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/new">
          <Button size="lg" className="w-full mb-8 bg-accent-blue hover:bg-accent-blue/80 text-base">
            + New Video
          </Button>
        </Link>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Videos</CardTitle>
            <Link href="/history" className="text-xs text-accent-blue hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-6 h-6 bg-bg-tertiary rounded" />
                    <div className="flex-1 h-4 bg-bg-tertiary rounded" />
                    <div className="w-12 h-3 bg-bg-tertiary rounded" />
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No videos yet. Start creating your first video!</p>
                <Link href="/new">
                  <Button className="bg-accent-blue hover:bg-accent-blue/80">⚡ Create Your First Video</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {videos.map(video => (
                  <RecentVideoRow key={video.video_id || video.job_id} video={video} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}