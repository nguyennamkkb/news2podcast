'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSettings, type UserSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VOICES = [
  { id: 'vi-VN-HoaiMyNeural', label: 'Nữ miền Bắc (Hoài My)' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam miền Bắc (Nam Minh)' },
  { id: 'en-US-JennyNeural', label: 'Female US (Jenny)' },
  { id: 'en-US-GuyNeural', label: 'Male US (Guy)' },
];

export default function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [saved, setSaved] = useState(false);

  if (isLoading) return null;

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-2xl font-display font-black">Settings</h1>
          <div className="w-16" />
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-accent-teal/20 border border-accent-teal/40 rounded-lg text-accent-teal text-sm text-center">
            ✅ Settings saved successfully
          </div>
        )}

        <Card className="bg-bg-secondary border-border mb-4">
          <CardHeader><CardTitle>Default Voice</CardTitle></CardHeader>
          <CardContent>
            <select
              value={settings.defaultVoice}
              onChange={e => { saveSettings({ defaultVoice: e.target.value }); showSaved(); }}
              className="w-full bg-bg-primary border-border rounded-lg p-3 text-white"
            >
              {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-4">
          <CardHeader><CardTitle>Default Format</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['9x16', '16x9'] as const).map(f => (
                <Button
                  key={f}
                  variant={settings.defaultFormat === f ? 'default' : 'outline'}
                  onClick={() => { saveSettings({ defaultFormat: f }); showSaved(); }}
                  className={settings.defaultFormat === f ? 'bg-accent-blue' : ''}
                >
                  {f === '9x16' ? '📱 9:16' : '🖥️ 16:9'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-4">
          <CardHeader><CardTitle>Default Slides: {settings.defaultSlideCount}</CardTitle></CardHeader>
          <CardContent>
            <input
              type="range" min={3} max={8}
              value={settings.defaultSlideCount}
              onChange={e => { saveSettings({ defaultSlideCount: Number(e.target.value) }); showSaved(); }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>3</span><span>8</span></div>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-4">
          <CardHeader><CardTitle>Default Duration</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {(['auto', 30, 60, 90] as const).map(d => (
                <Button
                  key={String(d)}
                  variant={settings.defaultTargetDuration === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { saveSettings({ defaultTargetDuration: d as UserSettings['defaultTargetDuration'] }); showSaved(); }}
                  className={settings.defaultTargetDuration === d ? 'bg-accent-blue' : ''}
                >
                  {d === 'auto' ? 'Auto' : `${d}s`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-6">
          <CardHeader><CardTitle>Ollama Cloud</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">API URL</label>
              <input
                type="text"
                value={settings.ollamaApiUrl}
                onChange={e => saveSettings({ ollamaApiUrl: e.target.value })}
                placeholder="https://your-ollama-cloud.com/api/generate"
                className="w-full bg-bg-primary border-border rounded-lg p-3 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Model</label>
              <input
                type="text"
                value={settings.ollamaModel}
                onChange={e => saveSettings({ ollamaModel: e.target.value })}
                placeholder="qwen3:32b"
                className="w-full bg-bg-primary border-border rounded-lg p-3 text-white text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}