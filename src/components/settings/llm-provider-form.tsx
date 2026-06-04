"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle2, Play } from "lucide-react";
import type { LLMPreset } from "@/lib/ai/presets";

interface FormData {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function LLMProviderForm() {
  const [presets, setPresets] = useState<LLMPreset[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      provider: "openai",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o",
    },
  });

  useEffect(() => {
    fetch("/api/settings/presets").then(r => r.json()).then(setPresets);
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.llm_provider) form.setValue("provider", data.llm_provider);
      if (data.llm_base_url) form.setValue("baseUrl", data.llm_base_url);
      if (data.llm_model) form.setValue("model", data.llm_model);
      // api key không hiển thị từ GET, user phải nhập lại hoặc để trống
    });
  }, []);

  const provider = form.watch("provider");
  const selectedPreset = presets.find(p => p.id === provider);

  const handleProviderChange = (id: string) => {
    form.setValue("provider", id);
    const preset = presets.find(p => p.id === id);
    if (preset && id !== "custom") {
      form.setValue("baseUrl", preset.baseUrl);
      if (preset.models.length > 0) form.setValue("model", preset.models[0] || "");
    }
  };

  const handleSave = async () => {
    const data = form.getValues();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llm_provider: data.provider,
          llm_api_key: data.apiKey,
          llm_base_url: data.baseUrl,
          llm_model: data.model,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Settings saved");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const data = form.getValues();
    if (!data.apiKey) {
      toast.error("Please enter an API key first");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: data.apiKey,
          baseUrl: data.baseUrl,
          model: data.model,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${result.message} (${result.latency}ms)`);
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch {
      toast.error("Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">LLM Provider</CardTitle>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing || !form.watch("apiKey")}
          >
            {testing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="sk-..."
              {...form.register("apiKey")}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Base URL</Label>
          <Input
            placeholder="https://api.openai.com/v1"
            disabled={provider !== "custom"}
            {...form.register("baseUrl")}
          />
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          {selectedPreset && selectedPreset.models.length > 0 && provider !== "custom" ? (
            <Select value={form.watch("model")} onValueChange={(v) => form.setValue("model", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectedPreset.models.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="gpt-4o" {...form.register("model")} />
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
