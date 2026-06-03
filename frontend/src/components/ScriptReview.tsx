'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
  Plus,
  Loader2,
  RotateCcw,
  Play,
} from 'lucide-react';

export interface Slide {
  title: string;
  bullets: string[];
  voiceover: string;
  duration_sec: number;
}

export interface ScriptReviewProps {
  slides: Slide[];
  config: {
    language: string;
    format: string;
    voice: string;
  };
  onApprove: (editedSlides: Slide[]) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}


function getRoleLabel(index: number, total: number): string {
  if (index === 0) return 'Hook';
  if (index === total - 1) return 'CTA';

  const middleIndex = index - 1;
  return middleIndex % 2 === 0 ? 'Main' : 'Analysis';
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Hook: 'default',
  Main: 'secondary',
  Analysis: 'outline',
  CTA: 'destructive',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function ScriptReview({
  slides,
  config,
  onApprove,
  onRegenerate,
  isLoading = false,
}: ScriptReviewProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedSlides, setEditedSlides] = useState<Slide[]>(() =>
    slides.map((s) => ({ ...s, bullets: [...s.bullets] }))
  );
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(() => {
    const set = new Set<number>();
    if (slides.length > 0) set.add(0);
    return set;
  });


  const currentSlides = editMode ? editedSlides : slides;

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const updateSlide = useCallback(
    (index: number, patch: Partial<Slide>) => {
      setEditedSlides((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, ...patch } : s
        )
      );
    },
    []
  );

  const addBullet = useCallback((index: number) => {
    setEditedSlides((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, bullets: [...s.bullets, ''] }
          : s
      )
    );
  }, []);

  const removeBullet = useCallback((slideIndex: number, bulletIndex: number) => {
    setEditedSlides((prev) =>
      prev.map((s, i) =>
        i === slideIndex
          ? { ...s, bullets: s.bullets.filter((_, bi) => bi !== bulletIndex) }
          : s
      )
    );
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      if (prev) {
        // Exiting edit mode — discard changes by resetting to current props
        setEditedSlides(slides.map((s) => ({ ...s, bullets: [...s.bullets] })));
      }
      return !prev;
    });
  }, [slides]);

  const handleApprove = useCallback(() => {
    const finalSlides = editMode
      ? editedSlides
      : slides.map((s) => ({ ...s, bullets: [...s.bullets] }));
    onApprove(finalSlides);
  }, [editMode, editedSlides, slides, onApprove]);

  const totalDuration = currentSlides.reduce(
    (sum, s) => sum + s.duration_sec,
    0
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Script Review</h2>
        <Button
          variant={editMode ? 'default' : 'outline'}
          size="sm"
          onClick={toggleEditMode}
          disabled={isLoading}
          className="gap-1.5"
        >
          {editMode ? (
            <>
              <Check className="size-4" />
              Done Editing
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              Edit
            </>
          )}
        </Button>
      </div>


      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">
          {currentSlides.length} slide{currentSlides.length !== 1 ? 's' : ''}
        </Badge>
        <span className="text-muted-foreground/60">·</span>
        <span>{formatDuration(totalDuration)} total</span>
        <span className="text-muted-foreground/60">·</span>
        <span>{config.language}</span>
        <span className="text-muted-foreground/60">·</span>
        <span>{config.format}</span>
        <span className="text-muted-foreground/60">·</span>
        <span>{config.voice}</span>
      </div>


      <div className="flex flex-col gap-3">
        {currentSlides.map((slide, index) => {
          const role = getRoleLabel(index, currentSlides.length);
          const isExpanded = expandedIndexes.has(index);

          return (
            <Collapsible
              key={index}
              open={isExpanded}
              onOpenChange={() => toggleExpand(index)}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer select-none py-3 px-4 flex-row items-center gap-3 space-y-0 [&>div]:flex [&>div]:items-center">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums w-6 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Badge variant={ROLE_VARIANT[role] ?? 'secondary'} className="shrink-0 text-[11px] px-1.5 py-0">
                      {role}
                    </Badge>
                    <span className="flex-1 font-medium truncate text-sm">
                      {slide.title}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {formatDuration(slide.duration_sec)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-4">

                    {editMode ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Title
                        </label>
                        <Input
                          value={editedSlides[index]?.title ?? ''}
                          onChange={(e) =>
                            updateSlide(index, { title: e.target.value })
                          }
                          className="text-sm"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-base font-semibold">{slide.title}</h4>
                      </div>
                    )}


                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Key Points
                      </label>
                      {editMode ? (
                        <ul className="flex flex-col gap-2">
                          {(editedSlides[index]?.bullets ?? []).map(
                            (bullet, bi) => (
                              <li key={bi} className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs select-none">
                                  •
                                </span>
                                <Input
                                  value={bullet}
                                  onChange={(e) => {
                                    const newBullets = [
                                      ...(editedSlides[index]?.bullets ?? []),
                                    ];
                                    newBullets[bi] = e.target.value;
                                    updateSlide(index, { bullets: newBullets });
                                  }}
                                  className="text-sm flex-1"
                                  disabled={isLoading}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeBullet(index, bi)}
                                  disabled={isLoading}
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </li>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="self-start gap-1 text-xs h-7"
                            onClick={() => addBullet(index)}
                            disabled={isLoading}
                          >
                            <Plus className="size-3" />
                            Add point
                          </Button>
                        </ul>
                      ) : (
                        <ul className="flex flex-col gap-1 list-disc list-outside ml-4 text-sm">
                          {slide.bullets.map((bullet, bi) => (
                            <li key={bi} className="pl-1">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>


                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Voiceover
                      </label>
                      {editMode ? (
                        <Textarea
                          value={editedSlides[index]?.voiceover ?? ''}
                          onChange={(e) =>
                            updateSlide(index, { voiceover: e.target.value })
                          }
                          rows={3}
                          className="text-sm resize-y"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          {slide.voiceover}
                        </p>
                      )}
                    </div>


                    {editMode && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Duration (seconds)
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={300}
                          value={editedSlides[index]?.duration_sec ?? ''}
                          onChange={(e) =>
                            updateSlide(index, {
                              duration_sec: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="text-sm w-24"
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>


      <div className="flex justify-center gap-3 pt-2 pb-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCcw className="size-4" />
          )}
          Regenerate Script
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Approve &amp; Create Video
        </Button>
      </div>
    </div>
  );
}