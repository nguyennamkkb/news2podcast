import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions';
import { NewsSlide } from '../components/NewsSlide';

interface SlideData {
  title: string;
  bullets: string[];
  voiceover: string;
  audioPath: string;
  duration: number;
  wordTimings?: Array<{ word: string; start: number; end: number }>;
  bgColor?: string;
}

export const NewsVideo: React.FC<{ slides: SlideData[] }> = ({ slides }) => {
  const fps = 30;
  const transitionFrames = Math.round(0.4 * fps);
  const bgColors = ['#0D1117', '#161B22', '#0D1117', '#161B22', '#0D1117'];

  return (
    <TransitionSeries>
      {slides.map((slide, i) => (
        <React.Fragment key={i}>
          <TransitionSeries.Sequence durationInFrames={Math.round(slide.duration * fps)}>
            <NewsSlide
              title={slide.title}
              bullets={slide.bullets}
              bgColor={slide.bgColor || bgColors[i % bgColors.length]}
              words={slide.wordTimings}
            />
          </TransitionSeries.Sequence>
          {i < slides.length - 1 && (
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({ durationInFrames: transitionFrames })}
            />
          )}
        </React.Fragment>
      ))}
    </TransitionSeries>
  );
};