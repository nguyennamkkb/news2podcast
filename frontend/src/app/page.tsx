'use client';

import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { RecentVideoRow } from "@/components/RecentVideoRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { Plus, TrendingUp, Clock, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const { videosThisWeek, avgTime, videos, isLoading } = useDashboardStats();

  return (
    <>
      <PageHeader>
        <Link href="/new">
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Video
          </Button>
        </Link>
      </PageHeader>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Videos created</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl font-bold">{videosThisWeek}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg duration</CardTitle>
                <Clock className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <div className="text-2xl font-bold">
                    {avgTime > 0 ? `${Math.floor(avgTime / 60)}m ${avgTime % 60}s` : '—'}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Per video</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Voice usage</CardTitle>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Free</div>
                <p className="text-xs text-muted-foreground mt-1">Edge TTS</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cost</CardTitle>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">~$0.00</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Videos</CardTitle>
                <Link href="/history">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col gap-3 py-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded" />
                        <Skeleton className="flex-1 h-4 rounded" />
                        <Skeleton className="w-12 h-3 rounded" />
                      </div>
                    ))}
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No videos yet. Start creating your first video!</p>
                    <Link href="/new">
                      <Button>Create Your First Video</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {videos.map((video, index) => (
                      <div key={video.video_id || video.job_id}>
                        <RecentVideoRow video={video} />
                        {index < videos.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
