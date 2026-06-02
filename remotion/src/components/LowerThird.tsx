import React from 'react';
import { useCurrentFrame } from 'remotion';
import { colors, typography } from '../design-tokens';

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface LowerThirdProps {
  words: WordTiming[];
}

export const LowerThird: React.FC<LowerThirdProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const currentTime = frame / fps;

  if (!words || words.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: 900,
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.65)',
        borderRadius: 16,
        padding: '24px 36px',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 10px',
          fontFamily: typography.fontSans,
          fontSize: typography.subtitleSize,
          fontWeight: 700,
          lineHeight: 1.4,
          textAlign: 'center',
        }}>
          {words.map((w, i) => {
            const isActive = currentTime >= w.start && currentTime < w.end;
            const isPast = currentTime >= w.end;
            return (
              <span key={i} style={{
                color: isActive ? colors.accentYellow : isPast ? colors.textMuted : colors.textPrimary,
                textShadow: isActive ? '0 0 12px rgba(255, 217, 61, 0.5)' : 'none',
              }}>
                {w.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};