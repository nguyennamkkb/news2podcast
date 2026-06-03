'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDownloadUrl } from '@/lib/api';
import type { VideoListItem, VideoListPagination } from '@/lib/types';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Download, Trash2, MoreVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'awaiting_review': return 'outline';
    case 'failed': return 'destructive';
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
      {isLoading ? (
        <div className="flex flex-col gap-2 py-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="w-14 h-14 rounded" />
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
                  <TableHead className="w-14" />
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-20">Duration</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map(video => {
                  const isProcessing = video.status === 'processing' || video.status === 'queued' || video.status === 'awaiting_review';
                  return (
                    <TableRow key={video.video_id || video.job_id} className="hover:bg-accent/30 transition-colors">
                      <TableCell>
                        <VideoThumbnail
                          videoId={video.status === 'completed' ? video.video_id : undefined}
                          status={video.status}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(video.status)} className="text-xs">
                          {video.status === 'awaiting_review' ? 'review' : video.status}
                        </Badge>
                        {isProcessing && (
                          <Progress value={33} className="h-1 mt-1.5 w-16" />
                        )}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
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
                            {video.status === 'completed' && video.video_id && (
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden flex flex-col gap-2">
            {videos.map(video => {
              const isProcessing = video.status === 'processing' || video.status === 'queued' || video.status === 'awaiting_review';
              return (
                <Link
                  key={video.video_id || video.job_id}
                  href={`/video/${video.job_id || video.video_id}`}
                  className="block p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <VideoThumbnail
                      videoId={video.status === 'completed' ? video.video_id : undefined}
                      status={video.status}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(video.status)} className="text-xs">
                          {video.status === 'awaiting_review' ? 'review' : video.status}
                        </Badge>
                        <span className="text-sm font-medium truncate">{video.title || 'Untitled'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                        <span>{timeAgoText(video.created_at)}</span>
                        {video.duration_sec > 0 && <span>{formatDuration(video.duration_sec)}</span>}
                      </div>
                      {isProcessing && (
                        <Progress value={33} className="h-1 mt-1.5" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, pagination.total_pages - 4));
            const pageNum = start + i;
            if (pageNum > pagination.total_pages) return null;
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="icon"
                className="size-8"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="icon" className="size-8" disabled={page >= pagination.total_pages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}