export const VOICES = [
  { id: 'vi-VN-HoaiMyNeural', label: 'Nữ miền Bắc (Hoài My)', language: 'vi', gender: 'female' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam miền Bắc (Nam Minh)', language: 'vi', gender: 'male' },
  { id: 'en-US-JennyNeural', label: 'Female US (Jenny)', language: 'en', gender: 'female' },
  { id: 'en-US-GuyNeural', label: 'Male US (Guy)', language: 'en', gender: 'male' },
  { id: 'en-GB-SoniaNeural', label: 'Female UK (Sonia)', language: 'en', gender: 'female' },
  { id: 'en-GB-RyanNeural', label: 'Male UK (Ryan)', language: 'en', gender: 'male' },
] as const;

export const FORMATS = ['9x16', '16x9'] as const;
export const DURATIONS = [30, 60, 90] as const;
export const SLIDE_COUNTS = [4, 5, 6] as const;

export const PIPELINE_STEPS = [
  'parsing',
  'scripting',
  'tts',
  'aligning',
  'rendering',
  'converting',
] as const;