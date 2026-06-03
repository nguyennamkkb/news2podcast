'use client';

import { getDownloadUrl } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

interface VideoThumbnailProps {
  videoId?: string;
  status: string;
  className?: string;
}

export function VideoThumbnail({ videoId, status, className = '' }: VideoThumbnailProps) {
  if (status === 'processing' || status === 'queued') {
    return (
      <div className={`w-14 h-14 bg-muted rounded flex items-center justify-center ${className}`}>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={`w-14 h-14 bg-destructive/10 rounded flex items-center justify-center ${className}`}>
        <AlertCircle className="size-5 text-destructive" />
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={`w-14 h-14 bg-muted rounded ${className}`} />
    );
  }

  return (
    <div className={`w-14 h-14 rounded overflow-hidden bg-muted ${className}`}>
      <img
        src={getDownloadUrl(videoId, '9x16')}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}