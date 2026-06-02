'use client';

interface VideoPreviewProps {
  src: string;
  aspectRatio?: '9:16' | '16:9';
  poster?: string;
  className?: string;
}

export function VideoPreview({ src, aspectRatio = '9:16', poster, className = '' }: VideoPreviewProps) {
  const maxWidth = aspectRatio === '9:16' ? 'max-w-[360px]' : 'max-w-[640px]';
  const arClass = aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';

  return (
    <div className={`${maxWidth} ${className}`}>
      <video
        src={src}
        poster={poster}
        controls
        className={`w-full ${arClass} rounded-lg bg-black`}
        preload="metadata"
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}