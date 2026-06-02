'use client';

import { useState } from 'react';
import { useSettings, type UserSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/page-header';
import { CheckCircle2, RotateCcw, Volume2, Monitor, SlidersHorizontal, Clock, Cloud } from 'lucide-react';

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

  const handleReset = () => {
    saveSettings({
      defaultVoice: 'vi-VN-HoaiMyNeural',
      defaultFormat: '9x16',
      defaultSlideCount: 5,
      defaultTargetDuration: 'auto',
    });
    showSaved();
  };

  return (
    <>
      <PageHeader>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </PageHeader>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-2xl">
          {saved && (
            <Alert className="mb-6 border-primary/40 bg-primary/10 text-primary">
              <CheckCircle2 className="size-4" />
              <AlertDescription>Settings saved successfully</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Video Defaults
              </h3>
              <p className="text-xs text-muted-foreground">Default values used when creating new videos</p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="size-4 text-muted-foreground" />
                  Voice
                </CardTitle>
                <CardDescription>Default voice for video narration</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.defaultVoice}
                  onValueChange={(value) => { saveSettings({ defaultVoice: value }); showSaved(); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="size-4 text-muted-foreground" />
                  Format
                </CardTitle>
                <CardDescription>Default aspect ratio for new videos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {(['9x16', '16x9'] as const).map(f => (
                    <Button
                      key={f}
                      variant={settings.defaultFormat === f ? 'default' : 'outline'}
                      onClick={() => { saveSettings({ defaultFormat: f }); showSaved(); }}
                    >
                      {f === '9x16' ? '9:16' : '16:9'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  Slides
                </CardTitle>
                <CardDescription>Default number of slides per video</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Slider
                    min={3} max={8} step={1}
                    value={[settings.defaultSlideCount]}
                    onValueChange={([value]) => { saveSettings({ defaultSlideCount: value }); showSaved(); }}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium tabular-nums w-6">{settings.defaultSlideCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  Duration
                </CardTitle>
                <CardDescription>Default target video length</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {(['auto', 30, 60, 90] as const).map(d => (
                    <Button
                      key={String(d)}
                      variant={settings.defaultTargetDuration === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { saveSettings({ defaultTargetDuration: d as UserSettings['defaultTargetDuration'] }); showSaved(); }}
                    >
                      {d === 'auto' ? 'Auto' : `${d}s`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-1 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Cloud className="size-4" />
                External Services
              </h3>
              <p className="text-xs text-muted-foreground">Third-party API configuration</p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cloud className="size-4 text-muted-foreground" />
                  Ollama Cloud
                </CardTitle>
                <CardDescription>LLM provider for script generation</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label>API URL</Label>
                  <Input
                    value={settings.ollamaApiUrl}
                    onChange={e => saveSettings({ ollamaApiUrl: e.target.value })}
                    placeholder="https://your-ollama-cloud.com/api/generate"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={settings.ollamaModel}
                    onChange={e => saveSettings({ ollamaModel: e.target.value })}
                    placeholder="qwen3:32b"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
