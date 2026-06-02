export const colors = {
  bgPrimary: '#0D1117',
  bgSecondary: '#161B22',
  bgTertiary: '#21262D',
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E7EB',
  textMuted: '#8B949E',
  accentRed: '#FF6B6B',
  accentYellow: '#FFD93D',
  accentTeal: '#4ECDC4',
  accentBlue: '#58A6FF',
  border: '#30363D',
} as const;

export const typography = {
  fontDisplay: '"Montserrat", sans-serif',
  fontSans: '"Inter", -apple-system, sans-serif',
  titleSize: 130,
  bulletSize: 52,
  subtitleSize: 42,
  strokeWidth: 8,
} as const;

export const layout = {
  safeTop: 220,
  safeBottom: 480,
  safeHorizontal: 90,
} as const;