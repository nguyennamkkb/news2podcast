'use client';

import { VoicePreview } from './VoicePreview';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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

const VOICES = [
  { value: 'vi-VN-HoaiMyNeural', label: 'Nữ miền Bắc (Hoài My)' },
  { value: 'vi-VN-NamMinhNeural', label: 'Nam miền Bắc (Nam Minh)' },
  { value: 'en-US-JennyNeural', label: 'Female US (Jenny)' },
  { value: 'en-US-GuyNeural', label: 'Male US (Guy)' },
];

const MUSIC_TRACKS = [
  { value: 'news-theme-1', label: '🎵 News Theme 1' },
  { value: 'corporate', label: '🏢 Corporate' },
  { value: 'upbeat', label: '⚡ Upbeat' },
];

/** Wrapper for a labeled form field section */
function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 ${className ?? ''}`}>{children}</div>;
}

/** Single field: label + control, wired via htmlFor/id */
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <FieldGroup>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </FieldGroup>
  );
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const bgMusicEnabled = config.backgroundMusic !== null;

  return (
    <div className="flex flex-col gap-6">
      <Field id="voice-select" label="Voice">
        <div className="flex gap-2 items-center">
          <Select
            value={config.voice}
            onValueChange={(value) => onChange({ voice: value })}
          >
            <SelectTrigger id="voice-select" className="flex-1">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <VoicePreview voiceId={config.voice} label={config.voice} />
        </div>
      </Field>

      {/* 3.3 Format */}
      <Field id="format-toggle" label="Format">
        <ToggleGroup
          type="single"
          value={config.format}
          onValueChange={(value) => {
            if (value) onChange({ format: value as '9x16' | '16x9' });
          }}
          variant="outline"
        >
          <ToggleGroupItem value="9x16">📱 9:16 (TikTok)</ToggleGroupItem>
          <ToggleGroupItem value="16x9">🖥️ 16:9 (YouTube)</ToggleGroupItem>
        </ToggleGroup>
      </Field>

      {/* 3.4 Duration — ToggleGroup */}
      <Field id="duration-toggle" label="Duration">
        <ToggleGroup
          type="single"
          value={String(config.targetDuration)}
          onValueChange={(value) => {
            if (value) onChange({ targetDuration: value === 'auto' ? 'auto' : Number(value) });
          }}
          variant="outline"
          size="sm"
        >
          {DURATIONS.map((d) => (
            <ToggleGroupItem key={String(d.id)} value={String(d.id)}>
              {d.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      {/* 3.5 Slide count — Slider + Label */}
      <Field id="slide-slider" label={`Slides: ${config.slideCount}`}>
        <Slider
          id="slide-slider"
          min={3}
          max={8}
          step={1}
          value={[config.slideCount]}
          onValueChange={([val]) => onChange({ slideCount: val })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3</span>
          <span>8</span>
        </div>
      </Field>

      {/* 3.6 Background Music — Switch + conditional Select */}
      <FieldGroup>
        <div className="flex items-center gap-2">
          <Switch
            id="bg-music-switch"
            checked={bgMusicEnabled}
            onCheckedChange={(checked) =>
              onChange({ backgroundMusic: checked ? 'news-theme-1' : null })
            }
          />
          <Label htmlFor="bg-music-switch">Background Music</Label>
        </div>
        {bgMusicEnabled && (
          <Select
            value={config.backgroundMusic ?? ''}
            onValueChange={(value) => onChange({ backgroundMusic: value })}
          >
            <SelectTrigger id="bg-music-select" className="flex-1">
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent>
              {MUSIC_TRACKS.map((track) => (
                <SelectItem key={track.value} value={track.value}>
                  {track.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FieldGroup>
    </div>
  );
}