import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { colors, typography } from '../design-tokens';

interface NewsSlideProps {
  title: string;
  bullets: string[];
  bgColor?: string;
}

export const NewsSlide: React.FC<NewsSlideProps> = ({
  title,
  bullets,
  bgColor = colors.bgPrimary,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <div
        style={{
          position: 'absolute',
          top: '30%',
          width: '100%',
          textAlign: 'center',
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: 900,
            fontSize: typography.titleSize,
            color: colors.textPrimary,
            lineHeight: 1.1,
            WebkitTextStroke: `${typography.strokeWidth}px #000000`,
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            padding: '0 60px',
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          width: '100%',
          padding: '0 120px',
          opacity: interpolate(frame, [15, 25], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {bullets.map((bullet, i) => (
          <p
            key={i}
            style={{
              fontFamily: typography.fontSans,
              fontWeight: 400,
              fontSize: typography.bulletSize,
              color: colors.textSecondary,
              lineHeight: 1.5,
              margin: '16px 0',
              textAlign: 'center',
            }}
          >
            • {bullet}
          </p>
        ))}
      </div>
    </AbsoluteFill>
  );
};