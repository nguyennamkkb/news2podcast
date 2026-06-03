'use client';

import { useState } from 'react';
import { useSettings, type UserSettings } from '@/hooks/useSettings';
import { testLLMConnection, type LLMTestResult } from '@/lib/api';
import type { LLMConfig } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/page-header';
import { CheckCircle2, RotateCcw, Volume2, Monitor, SlidersHorizontal, Clock, Cloud, Eye, EyeOff, Loader2, Zap } from 'lucide-react';

const VOICES = [
  { id: 'vi-VN-HoaiMyNeural', label: 'Nữ miền Bắc (Hoài My)' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam miền Bắc (Nam Minh)' },
  { id: 'en-US-JennyNeural', label: 'Female US (Jenny)' },
  { id: 'en-US-GuyNeural', label: 'Male US (Guy)' },
];

function maskKey(key: string): string {
  if (!key || key.length <= 4) return key ? '****' : '';
  return `****${key.slice(-4)}`;
}

export default function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyFocused, setApiKeyFocused] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<LLMTestResult | null>(null);

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
      llmProvider: 'ollama',
      llmApiUrl: '',
      llmApiKey: '',
      llmModel: 'qwen3:32b',
    });
    showSaved();
  };

  const isOllama = settings.llmProvider === 'ollama';

  const displayedApiKey = showApiKey || apiKeyFocused
    ? settings.llmApiKey
    : maskKey(settings.llmApiKey);

  const handleTestConnection = async () => {
    setTestState('loading');
    setTestResult(null);

    const config: LLMConfig = isOllama
      ? { provider: 'ollama', api_url: settings.ollamaApiUrl, model: settings.ollamaModel }
      : { provider: 'openai', api_url: settings.llmApiUrl, api_key: settings.llmApiKey || undefined, model: settings.llmModel };

    try {
      const result = await testLLMConnection(config);
      setTestResult(result);
      setTestState(result.success ? 'success' : 'error');
    } catch {
      setTestResult({ success: false, message: 'Network error — check if backend is running', latency_ms: 0 });
      setTestState('error');
    }
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                Video Defaults
              </CardTitle>
              <CardDescription>Default values used when creating new videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="voice-select" className="flex items-center gap-1">
                    <Volume2 className="size-3.5" />
                    Voice
                  </Label>
                  <Select
                    value={settings.defaultVoice}
                    onValueChange={(value) => { saveSettings({ defaultVoice: value }); showSaved(); }}
                  >
                    <SelectTrigger id="voice-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICES.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format-toggle">Format</Label>
                  <div className="flex gap-1">
                    {(['9x16', '16x9'] as const).map(f => (
                      <Button
                        key={f}
                        variant={settings.defaultFormat === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { saveSettings({ defaultFormat: f }); showSaved(); }}
                        className="flex-1"
                      >
                        {f === '9x16' ? '9:16' : '16:9'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Slides: {settings.defaultSlideCount}</Label>
                  <Slider
                    min={3} max={8} step={1}
                    value={[settings.defaultSlideCount]}
                    onValueChange={([value]) => { saveSettings({ defaultSlideCount: value }); showSaved(); }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3</span>
                    <span>8</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="flex gap-1 flex-wrap">
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
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    BGM
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="bg-music-switch"
                      checked={settings.backgroundMusic !== null}
                      onCheckedChange={(checked) =>
                        saveSettings({ backgroundMusic: checked ? 'news-theme-1' : null })
                      }
                    />
                    <Label htmlFor="bg-music-switch" className="text-xs">
                      {settings.backgroundMusic ? 'On' : 'Off'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="size-4 text-muted-foreground" />
                LLM Provider
              </CardTitle>
              <CardDescription>AI model for script generation</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label>Provider</Label>
                <Select
                  value={settings.llmProvider}
                  onValueChange={(value: 'ollama' | 'openai') => {
                    saveSettings({ llmProvider: value });
                    showSaved();
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ollama">Ollama</SelectItem>
                    <SelectItem value="openai">OpenAI-compatible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isOllama ? (
                <>
                  <div>
                    <Label>API URL</Label>
                    <Input
                      value={settings.ollamaApiUrl}
                      onChange={e => { saveSettings({ ollamaApiUrl: e.target.value }); showSaved(); }}
                      placeholder="https://your-ollama-cloud.com/api/generate"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={settings.ollamaModel}
                      onChange={e => { saveSettings({ ollamaModel: e.target.value }); showSaved(); }}
                      placeholder="qwen3:32b"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>API URL</Label>
                    <Input
                      value={settings.llmApiUrl}
                      onChange={e => { saveSettings({ llmApiUrl: e.target.value }); showSaved(); }}
                      placeholder="https://api.openai.com/v1/chat/completions"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={displayedApiKey}
                        onFocus={() => { setApiKeyFocused(true); setShowApiKey(true); }}
                        onBlur={() => { setApiKeyFocused(false); setShowApiKey(false); }}
                        onChange={e => { saveSettings({ llmApiKey: e.target.value }); showSaved(); }}
                        placeholder="sk-..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                        type="button"
                      >
                        {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={settings.llmModel}
                      onChange={e => { saveSettings({ llmModel: e.target.value }); showSaved(); }}
                      placeholder="gpt-4o-mini"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testState === 'loading' || (!isOllama ? !settings.llmApiUrl : !settings.ollamaApiUrl)}
                  className="gap-2"
                >
                  {testState === 'loading' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Zap className="size-3.5" />
                  )}
                  Test Connection
                </Button>
                {testResult && (
                  <span className={`text-xs ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                    {testResult.success
                      ? `✓ ${testResult.message} (${testResult.latency_ms}ms)`
                      : `✗ ${testResult.message}`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}