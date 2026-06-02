'use client';

import { VoicePreview } from './VoicePreview';
import { BgMusicSelector } from './BgMusicSelector';
import { Button } from '@/components/ui/button';

interface ConfigPanelProps {
  config: {
    voice: string;
    format: '9x16' | '16x9';
    targetDuration: number | 'auto';
    slideCount: number;
    backgroundMusic: string | null;
  };
  onChange: (partial: Partial<ConfigPanelProps['config']>) => void;
}

const DURATIONS = [
  { id: 'auto' as const, label: 'Auto' },
  { id: 30, label: '30s' },
  { id: 60, label: '60s' },
  { id: 90, label: '90s' },
];

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-gray-400 block mb-2">Voice</label>
        <div className="flex gap-2 items-center">
          <select
            value={config.voice}
            onChange={e => onChange({ voice: e.target.value })}
            className="flex-1 bg-bg-primary border-border rounded-lg p-3 text-white"
          >
            <option value="vi-VN-HoaiMyNeural">Nữ miền Bắc (Hoài My)</option>
            <option value="vi-VN-NamMinhNeural">Nam miền Bắc (Nam Minh)</option>
            <option value="en-US-JennyNeural">Female US (Jenny)</option>
            <option value="en-US-GuyNeural">Male US (Guy)</option>
          </select>
          <VoicePreview voiceId={config.voice} label={config.voice} />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Format</label>
        <div className="flex gap-2">
          {(['9x16', '16x9'] as const).map(f => (
            <Button
              key={f}
              variant={config.format === f ? 'default' : 'outline'}
              onClick={() => onChange({ format: f })}
              className={config.format === f ? 'bg-accent-blue' : ''}
            >
              {f === '9x16' ? '📱 9:16 (TikTok)' : '🖥️ 16:9 (YouTube)'}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Duration</label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d => (
            <Button
              key={String(d.id)}
              variant={config.targetDuration === d.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ targetDuration: d.id })}
              className={config.targetDuration === d.id ? 'bg-accent-blue' : ''}
            >
              {d.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Slides: {config.slideCount}</label>
        <input
          type="range" min={3} max={8}
          value={config.slideCount}
          onChange={e => onChange({ slideCount: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>3</span><span>8</span></div>
      </div>

      <div>
        <label className="text-sm text-gray-400 block mb-2">Background Music</label>
        <BgMusicSelector selected={config.backgroundMusic} onSelect={id => onChange({ backgroundMusic: id })} />
      </div>
    </div>
  );
}