"use client";

import type { Slide } from "@/types/script";
import { SlideCard } from "./slide-card";

interface ScriptTimelineProps {
  slides: Slide[];
  onEditSlide?: (slide: Slide) => void;
}

export function ScriptTimeline({ slides, onEditSlide }: ScriptTimelineProps) {
  let cumSeconds = 0;

  return (
    <div className="space-y-0">
      {slides.map((slide, i) => {
        const start = cumSeconds;
        cumSeconds += slide.duration;
        return (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={i}
            cumSeconds={start}
            onEdit={onEditSlide}
          />
        );
      })}
    </div>
  );
}
