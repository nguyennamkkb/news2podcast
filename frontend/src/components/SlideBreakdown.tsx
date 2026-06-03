'use client';

import { useState } from 'react';
import type { Slide } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ROLE_LABELS = ['Hook', 'Main', 'Analysis', 'CTA'];

interface SlideBreakdownProps {
  slides: Slide[];
}

export function SlideBreakdown({ slides }: SlideBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const totalDuration = slides.reduce((sum, s) => sum + (s.duration_sec || 5), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Slides</span>
          <span className="text-sm font-normal text-muted-foreground">
            {slides.length} slides · {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {slides.map((slide, index) => {
          const isExpanded = expandedIndex === index;
          const roleLabel = index === 0 ? ROLE_LABELS[0]
            : index === slides.length - 1 ? ROLE_LABELS[3]
            : ROLE_LABELS[1 + (index % 2 === 0 ? 1 : 0)];

          return (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="size-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground tabular-nums w-5 flex-shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{roleLabel}</Badge>
                <span className="text-sm font-medium truncate flex-1">{slide.title}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{slide.duration_sec || 5}s</span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Bullets</p>
                    <ul className="list-disc list-inside text-sm space-y-0.5">
                      {slide.bullets.map((bullet, bi) => (
                        <li key={bi}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Voiceover</p>
                    <p className="text-sm leading-relaxed">{slide.voiceover}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}