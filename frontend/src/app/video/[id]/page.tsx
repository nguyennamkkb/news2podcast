'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJobPolling } from '@/hooks/useJobPolling';
import { ProgressTracker } from '@/components/ProgressTracker';
import { VideoPreview } from '@/components/VideoPreview';
import { ScriptReview } from '@/components/ScriptReview';
import { SlideBreakdown } from '@/components/SlideBreakdown';
import { approveScript, rejectScript, getDownloadUrl } from '@/lib/api';
import type { Slide } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { RefreshCw, Download, RotateCcw, Ban, ClipboardCopy, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function VideoDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { data: job, isLoading } = useJobPolling(jobId);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleApprove = async (editedSlides: Slide[]) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await approveScript(jobId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve script');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await rejectScript(jobId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to regenerate script');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !job || job.status === 'queued' || job.status === 'processing') {
    const percent = job?.progress?.percent ?? 0;
    const remainingStep = job?.progress?.steps?.find(s => s.status === 'in_progress' || s.status === 'pending');
    return (
      <>
        <PageHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="text-lg font-semibold mb-4">Generating Video</h2>
            <ProgressTracker jobId={jobId} />
            {job?.progress && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {percent >= 95 ? 'Almost done...' : `Step: ${remainingStep?.name ?? '...'} — ${percent}% complete`}
              </p>
            )}
            <div className="text-center mt-6">
              <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="text-destructive gap-2">
                <Ban className="size-4" />
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (job.status === 'awaiting_review' && job.script_data) {
    const config = {
      language: 'vi',
      format: '9:16',
      voice: 'vi-VN-HoaiMyNeural',
    };
    const totalDuration = job.script_data.slides.reduce((sum, s) => sum + (s.duration_sec || 5), 0);

    return (
      <>
        <PageHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <h2 className="text-lg font-semibold mb-4">Review Generated Script</h2>
            <ScriptReview
              slides={job.script_data.slides}
              config={config}
              onApprove={handleApprove}
              onRegenerate={handleRegenerate}
              isLoading={actionLoading}
            />
            {actionError && (
              <p className="text-sm text-destructive mt-2 text-center">{actionError}</p>
            )}
          </div>
        </main>
      </>
    );
  }

  if (job.status === 'cancelled') {
    return (
      <>
        <PageHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="size-5 text-yellow-500" />
                  Cancelled
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">This job was cancelled.</p>
                <Link href="/new"><Button>Create New Video</Button></Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (job.status === 'failed') {
    return (
      <>
        <PageHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  Generation Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.error_message || 'Unknown error'}</p>
                <div className="flex gap-2">
                  <Link href="/new">
                    <Button className="gap-2">
                      <RotateCcw className="size-4" />
                      Retry
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleCopyError} disabled={copied} className="gap-2">
                    <ClipboardCopy className="size-4" />
                    {copied ? 'Copied' : 'Copy Error'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-semibold">Video Ready</h2>
            {job?.progress?.steps?.some((s: any) => s.name === 'cached') && (
              <Badge variant="secondary">
                <RefreshCw className="size-3 mr-1" />
                Cached
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">9:16 (TikTok/Shorts)</p>
                <VideoPreview src={getDownloadUrl(jobId, '9x16')} aspectRatio="9:16" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">16:9 (YouTube)</p>
                <VideoPreview src={getDownloadUrl(jobId, '16x9')} aspectRatio="16:9" />
              </div>

              <Card>
                <CardContent className="py-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="font-semibold truncate">{job.video?.title || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Slides</p>
                      <p className="font-semibold">{job.video?.slide_count || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{job.video?.duration_sec ? formatDuration(job.video.duration_sec) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-semibold">{job.created_at ? new Date(job.created_at).toLocaleTimeString() : '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-2">
                <a href={getDownloadUrl(jobId, '9x16')} download className="flex-1">
                  <Button className="w-full gap-2">
                    <Download className="size-4" />
                    Download 9:16
                  </Button>
                </a>
                <a href={getDownloadUrl(jobId, '16x9')} download className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <Download className="size-4" />
                    Download 16:9
                  </Button>
                </a>
                <Link href="/new" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <RotateCcw className="size-4" />
                    Regenerate
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              {job.script_data && job.script_data.slides.length > 0 ? (
                <SlideBreakdown slides={job.script_data.slides} />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Slide breakdown not available for this video</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}