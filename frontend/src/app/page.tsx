'use client';

import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { LLMStatusBadge } from "@/components/LLMStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { getDownloadUrl } from "@/lib/api";
import { Plus, TrendingUp, Clock, Loader2, MoreVertical, Eye, Download, Trash2 } from "lucide-react";
import type { VideoListItem } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
}

export default function DashboardPage() {
  const { videosThisWeek, avgTime, videos, isLoading } = useDashboardStats();

  const activeJobs = videos.filter(v => v.status === 'processing' || v.status === 'queued' || v.status === 'awaiting_review').length;

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
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Loader2 className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-8" /> : (
                  <div className="text-2xl font-bold">{activeJobs}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Active now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">LLM Status</CardTitle>
              </CardHeader>
              <CardContent>
                <LLMStatusBadge />
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
                        <Skeleton className="w-14 h-14 rounded" />
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
                    {videos.map((video) => (
                      <VideoRow key={video.video_id || video.job_id} video={video} />
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

function VideoRow({ video }: { video: VideoListItem }) {
  const isProcessing = video.status === 'processing' || video.status === 'queued';

  return (
    <div className="flex items-center gap-3 py-2.5 px-2 hover:bg-accent/30 rounded transition-colors">
      <VideoThumbnail
        videoId={video.status === 'completed' ? video.video_id : undefined}
        status={video.status}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{video.title || 'Untitled'}</p>
          <Badge variant={statusBadgeVariant(video.status)} className="text-xs flex-shrink-0">
            {video.status === 'awaiting_review' ? 'review' : video.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{timeAgo(video.created_at)}</span>
          {video.duration_sec > 0 && (
            <>
              <span>·</span>
              <span>{formatDuration(video.duration_sec)}</span>
            </>
          )}
        </div>
        {isProcessing && (
          <Progress value={33} className="h-1.5 mt-1.5 w-32" />
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 flex-shrink-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/video/${video.job_id || video.video_id}`}>
              <Eye className="size-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          {video.status === 'completed' && (
            <>
              <DropdownMenuItem asChild>
                <a href={getDownloadUrl(video.video_id, '9x16')} download>
                  <Download className="size-4 mr-2" />
                  Download 9:16
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={getDownloadUrl(video.video_id, '16x9')} download>
                  <Download className="size-4 mr-2" />
                  Download 16:9
                </a>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}