'use client';

import Link from 'next/link';
import { getDownloadUrl } from '@/lib/api';
import type { VideoListItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'failed': return 'destructive';
    case 'queued': return 'outline';
    case 'cancelled': return 'outline';
    default: return 'outline';
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface RecentVideoRowProps {
  video: VideoListItem;
}

export function RecentVideoRow({ video }: RecentVideoRowProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 py-2.5 hover:bg-accent/30 px-2 rounded transition-colors">
        <Badge variant={statusBadgeVariant(video.status)} className="flex-shrink-0">{video.status}</Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{video.title || 'Untitled'}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(video.created_at)}</p>
        </div>
        {video.duration_sec > 0 && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {Math.floor(video.duration_sec / 60)}:{String(Math.floor(video.duration_sec % 60)).padStart(2, '0')}
          </span>
        )}
        <div className="flex gap-1 flex-shrink-0">
          {video.status === 'completed' && (
            <>
              <a href={getDownloadUrl(video.video_id, '9x16')} download className="text-primary hover:underline text-xs px-1">9:16</a>
              <a href={getDownloadUrl(video.video_id, '16x9')} download className="text-secondary-foreground hover:underline text-xs px-1">16:9</a>
            </>
          )}
          <Link href={`/video/${video.job_id || video.video_id}`} className="text-xs text-muted-foreground hover:text-foreground px-1">View</Link>
        </div>
      </div>
      <Separator />
    </div>
  );
}
