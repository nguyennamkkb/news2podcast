'use client';

import Link from 'next/link';
import { getDownloadUrl } from '@/lib/api';
import type { VideoListItem } from '@/lib/types';

const STATUS_ICONS: Record<string, string> = {
  completed: '✅',
  processing: '🔄',
  queued: '⏳',
  failed: '❌',
  cancelled: '🚫',
};

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
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-bg-tertiary/30 px-2 rounded transition-colors">
      <span className="text-lg flex-shrink-0">{STATUS_ICONS[video.status] || '❓'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{video.title || 'Untitled'}</p>
        <p className="text-xs text-gray-500">{timeAgo(video.created_at)}</p>
      </div>
      {video.duration_sec > 0 && (
        <span className="text-xs text-gray-500 flex-shrink-0">
          {Math.floor(video.duration_sec / 60)}:{String(Math.floor(video.duration_sec % 60)).padStart(2, '0')}
        </span>
      )}
      <div className="flex gap-1 flex-shrink-0">
        {video.status === 'completed' && (
          <>
            <a href={getDownloadUrl(video.video_id, '9x16')} download className="text-accent-blue hover:underline text-xs px-1">9:16</a>
            <a href={getDownloadUrl(video.video_id, '16x9')} download className="text-accent-teal hover:underline text-xs px-1">16:9</a>
          </>
        )}
        <Link href={`/video/${video.job_id || video.video_id}`} className="text-xs text-gray-400 hover:text-white px-1">View</Link>
      </div>
    </div>
  );
}