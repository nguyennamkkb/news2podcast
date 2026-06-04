"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { MessageSquare, ImageIcon, FileText } from "lucide-react";
import type { Slide } from "@/types/script";

const typeConfig: Record<string, { label: string; className: string }> = {
  intro: { label: "Intro", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  content: { label: "Content", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  transition: { label: "Transition", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  outro: { label: "Outro", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  cta: { label: "CTA", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

interface SlideCardProps {
  slide: Slide;
  index: number;
  onEdit?: (slide: Slide) => void;
  cumSeconds?: number;
}

export function SlideCard({ slide, index, onEdit, cumSeconds }: SlideCardProps) {
  const typeCfg = typeConfig[slide.type] || typeConfig.content;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 w-px bg-border my-1" />
      </div>

      <Card
        className={cn("flex-1 mb-1", onEdit && "cursor-pointer hover:shadow-sm")}
        onClick={() => onEdit?.(slide)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">
              {cumSeconds != null ? formatDuration(cumSeconds) : ""}
            </span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeCfg.className)}>
              {typeCfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {slide.duration}s · {slide.transition}
            </span>
          </div>

          <h4 className="font-semibold text-sm">{slide.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{slide.content}</p>

          {slide.subtitle && (
            <p className="text-[11px] text-muted-foreground mt-1 italic flex items-start gap-1">
              <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-px" />
              {slide.subtitle}
            </p>
          )}

          <p className="text-[11px] text-muted-foreground mt-1 flex items-start gap-1">
            <ImageIcon className="h-3.5 w-3.5 shrink-0 mt-px" />
            {slide.visualDescription}
          </p>

          {slide.notes && (
            <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-start gap-1">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-px" />
              {slide.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
