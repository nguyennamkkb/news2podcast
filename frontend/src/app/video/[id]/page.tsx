'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJobPolling } from '@/hooks/useJobPolling';
import { ProgressTracker } from '@/components/ProgressTracker';
import { VideoPreview } from '@/components/VideoPreview';
import { getDownloadUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function VideoDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { data: job, isLoading } = useJobPolling(jobId);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch(`${API_BASE}/api/v1/jobs/${jobId}`, { method: 'DELETE' });
      window.location.reload();
    } catch {
      setCancelling(false);
    }
  };

  const handleCopyError = () => {
    if (job?.error_message) {
      navigator.clipboard.writeText(job.error_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !job || job.status === 'queued' || job.status === 'processing') {
    const percent = job?.progress?.percent ?? 0;
    const remainingStep = job?.progress?.steps?.find(s => s.status === 'in_progress' || s.status === 'pending');
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
            <h1 className="text-xl md:text-2xl font-display font-black">Generating...</h1>
            <div className="w-16" />
          </div>
          <ProgressTracker jobId={jobId} />
          {job?.progress && (
            <p className="text-center text-sm text-gray-400 mt-4">
              {percent >= 95 ? 'Almost done...' : `Step: ${remainingStep?.name ?? '...'} — ${percent}% complete`}
            </p>
          )}
          <div className="text-center mt-6">
            <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (job.status === 'cancelled') {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 block">← Back</Link>
          <Card className="bg-bg-secondary border-border">
            <CardHeader><CardTitle className="text-yellow-400">🚫 Cancelled</CardTitle></CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-400 mb-4">This job was cancelled.</p>
              <Link href="/new"><Button className="bg-accent-blue hover:bg-accent-blue/80">Create New Video</Button></Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (job.status === 'failed') {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 block">← Back</Link>
          <Card className="bg-bg-secondary border-border">
            <CardHeader><CardTitle className="text-red-400">❌ Generation Failed</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">{job.error_message || 'Unknown error'}</p>
              <div className="flex gap-2">
                <Link href="/new">
                  <Button className="bg-accent-blue hover:bg-accent-blue/80">🔄 Retry</Button>
                </Link>
                <Button variant="outline" onClick={handleCopyError} disabled={copied}>
                  {copied ? '✅ Copied' : '📋 Copy Error'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-xl md:text-2xl font-display font-black">✅ Video Ready</h1>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2">9:16 (TikTok/Shorts)</p>
            <VideoPreview src={getDownloadUrl(jobId, '9x16')} aspectRatio="9:16" />
          </div>

          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2">16:9 (YouTube)</p>
            <VideoPreview src={getDownloadUrl(jobId, '16x9')} aspectRatio="16:9" />
          </div>

          <div className="md:col-span-2">
            <Card className="bg-bg-secondary border-border">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Title</p>
                    <p className="font-bold text-sm md:text-base truncate max-w-[200px] mx-auto">{job.video?.title || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Slides</p>
                    <p className="font-bold">{job.video?.slide_count || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-bold">{job.video?.duration_sec ? formatDuration(job.video.duration_sec) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="font-bold text-sm">{job.created_at ? new Date(job.created_at).toLocaleTimeString() : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={getDownloadUrl(jobId, '9x16')} download>
              <Button className="w-full sm:w-auto bg-accent-blue hover:bg-accent-blue/80">⬇ Download 9:16 (MP4)</Button>
            </a>
            <a href={getDownloadUrl(jobId, '16x9')} download>
              <Button className="w-full sm:w-auto bg-accent-teal hover:bg-accent-teal/80">⬇ Download 16:9 (MP4)</Button>
            </a>
            <Link href="/new">
              <Button variant="outline" className="w-full sm:w-auto">🔄 Regenerate</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}