'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDownloadUrl } from '@/lib/api';
import type { VideoListItem, VideoListPagination } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgoText(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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

interface HistoryTableProps {
  videos: VideoListItem[];
  isLoading: boolean;
  pagination: VideoListPagination | null;
  page: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function HistoryTable({
  videos, isLoading, pagination, page, onPageChange,
  searchQuery, onSearchChange, statusFilter, onStatusFilterChange,
}: HistoryTableProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(localSearch), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [localSearch, onSearchChange]);

  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          placeholder="🔍 Search by title..."
          className="flex-1 bg-background border-border rounded-lg p-2 text-foreground text-sm"
        />
        <select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          className="bg-background border-border rounded-lg p-2 text-foreground text-sm"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 py-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="w-8 h-4 rounded" />
              <Skeleton className="flex-1 h-4 rounded" />
              <Skeleton className="w-16 h-3 rounded" />
              <Skeleton className="w-12 h-3 rounded" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No videos match your search.' : 'No videos yet.'}
          {!searchQuery && (
            <div className="mt-2">
              <Link href="/new" className="text-primary hover:underline">Create your first video</Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-20">Duration</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map(video => (
                  <TableRow key={video.video_id || video.job_id} className="hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <Badge variant={statusBadgeVariant(video.status)}>{video.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/video/${video.job_id || video.video_id}`} className="text-sm font-medium hover:text-primary truncate block max-w-[300px]">
                        {video.title || 'Untitled'}
                      </Link>
                      <span className="text-xs text-muted-foreground">{timeAgoText(video.created_at)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(video.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDuration(video.duration_sec)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {video.status === 'completed' && video.video_id && (
                          <>
                            <a href={getDownloadUrl(video.video_id, '9x16')} download className="text-primary hover:underline text-xs">9:16</a>
                            <a href={getDownloadUrl(video.video_id, '16x9')} download className="text-secondary-foreground hover:underline text-xs">16:9</a>
                          </>
                        )}
                        <Link href={`/video/${video.job_id || video.video_id}`} className="text-xs text-muted-foreground hover:text-foreground">View</Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden flex flex-col gap-2">
            {videos.map(video => (
              <Link
                key={video.video_id || video.job_id}
                href={`/video/${video.job_id || video.video_id}`}
                className="block p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={statusBadgeVariant(video.status)}>{video.status}</Badge>
                  <span className="text-sm font-medium truncate">{video.title || 'Untitled'}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{timeAgoText(video.created_at)}</span>
                  <span>{formatDuration(video.duration_sec)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <Separator />

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ← Prev
          </Button>
          {Array.from({ length: Math.min(pagination.total_pages, 7) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={page === pageNum ? 'bg-primary' : ''}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => onPageChange(page + 1)}>
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
