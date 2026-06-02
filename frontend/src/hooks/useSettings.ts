'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
  defaultVoice: string;
  defaultFormat: '9x16' | '16x9';
  defaultOutputs: ('9x16' | '16x9')[];
  defaultSlideCount: number;
  defaultTargetDuration: number | 'auto';
  ollamaApiUrl: string;
  ollamaModel: string;
}

const STORAGE_KEY = 'news2video-settings';

const DEFAULTS: UserSettings = {
  defaultVoice: 'vi-VN-HoaiMyNeural',
  defaultFormat: '9x16',
  defaultOutputs: ['9x16', '16x9'],
  defaultSlideCount: 5,
  defaultTargetDuration: 'auto',
  ollamaApiUrl: '',
  ollamaModel: 'qwen3:32b',
};

function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const saveSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { settings, saveSettings, isLoading: !loaded };
}