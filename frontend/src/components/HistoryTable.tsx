'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDownloadUrl } from '@/lib/api';
import type { VideoListItem, VideoListPagination } from '@/lib/types';
import { Button } from '@/components/ui/button';

const STATUS_ICONS: Record<string, string> = {
  completed: '✅', processing: '🔄', queued: '⏳', failed: '❌', cancelled: '🚫',
};

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
    <div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          placeholder="🔍 Search by title..."
          className="flex-1 bg-bg-primary border-border rounded-lg p-2 text-white text-sm"
        />
        <select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          className="bg-bg-primary border-border rounded-lg p-2 text-white text-sm"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4 py-3">
              <div className="w-8 h-4 bg-bg-tertiary rounded" />
              <div className="flex-1 h-4 bg-bg-tertiary rounded" />
              <div className="w-16 h-3 bg-bg-tertiary rounded" />
              <div className="w-12 h-3 bg-bg-tertiary rounded" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {searchQuery ? 'No videos match your search.' : 'No videos yet.'}
          {!searchQuery && (
            <div className="mt-2">
              <Link href="/new" className="text-accent-blue hover:underline">Create your first video</Link>
            </div>
          )}
        </div>
      ) : (
        <>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-border">
                <tr>
                  <th className="py-2 px-3 w-16">Status</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3 w-24">Date</th>
                  <th className="py-2 px-3 w-20">Duration</th>
                  <th className="py-2 px-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(video => (
                  <tr key={video.video_id || video.job_id} className="border-b border-border/30 hover:bg-bg-tertiary/30 transition-colors">
                    <td className="py-3 px-3 text-lg">{STATUS_ICONS[video.status] || '❓'}</td>
                    <td className="py-3 px-3">
                      <Link href={`/video/${video.job_id || video.video_id}`} className="text-sm font-medium hover:text-accent-blue truncate block max-w-[300px]">
                        {video.title || 'Untitled'}
                      </Link>
                      <span className="text-xs text-gray-500">{timeAgoText(video.created_at)}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-400">{new Date(video.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-sm text-gray-400">{formatDuration(video.duration_sec)}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        {video.status === 'completed' && video.video_id && (
                          <>
                            <a href={getDownloadUrl(video.video_id, '9x16')} download className="text-accent-blue hover:underline text-xs">9:16</a>
                            <a href={getDownloadUrl(video.video_id, '16x9')} download className="text-accent-teal hover:underline text-xs">16:9</a>
                          </>
                        )}
                        <Link href={`/video/${video.job_id || video.video_id}`} className="text-xs text-gray-400 hover:text-white">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="sm:hidden space-y-2">
            {videos.map(video => (
              <Link
                key={video.video_id || video.job_id}
                href={`/video/${video.job_id || video.video_id}`}
                className="block p-3 bg-bg-primary border border-border rounded-lg hover:border-accent-blue/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{STATUS_ICONS[video.status] || '❓'}</span>
                  <span className="text-sm font-medium truncate">{video.title || 'Untitled'}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{timeAgoText(video.created_at)}</span>
                  <span>{formatDuration(video.duration_sec)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}


      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
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
                className={page === pageNum ? 'bg-accent-blue' : ''}
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