"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validators/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "../shared/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const durationOptions = [
  { value: "60", label: "1 minute" },
  { value: "120", label: "2 minutes" },
  { value: "180", label: "3 minutes" },
  { value: "300", label: "5 minutes" },
  { value: "600", label: "10 minutes" },
  { value: "900", label: "15 minutes" },
];

const styleOptions = ["professional", "casual", "educational", "marketing", "storytelling"];
const platformOptions = ["youtube", "tiktok", "facebook", "generic"];
const visualStyles = ["cinematic", "realistic", "flat_illustration", "minimalist", "infographic"];
const languages = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export default function ProjectCreateForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      promptInput: "",
      targetDuration: 300,
      style: "professional",
      language: "vi",
      targetPlatform: "youtube",
      visualStyle: "cinematic",
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        const projectId = json.data.id;
        fetch(`/api/projects/${projectId}/generate`, { method: "POST" }).catch((err) => {
          console.error("[CreateProject]", err);
          toast.error("Không thể tạo project. Vui lòng thử lại.");
        });
        router.push("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Video Script</CardTitle>
          <CardDescription>
            Describe what you want and AI will generate a complete video script.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Title" required>
            <Input
              placeholder='e.g. "5 tips to improve productivity"'
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </FormField>

          <FormField label="Requirements / Prompt" required id="promptInput">
            <Textarea
              placeholder={`Describe what you want the video script to cover...

e.g. "Create an engaging 3-minute explainer video about the benefits of remote work. Include statistics and practical tips. Use a professional but friendly tone."`}
              className="min-h-[160px]"
              {...form.register("promptInput")}
            />
            {form.formState.errors.promptInput && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.promptInput.message}</p>
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration" id="targetDuration">
              <Select
                value={String(form.watch("targetDuration"))}
                onValueChange={(v) => form.setValue("targetDuration", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.targetDuration && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.targetDuration.message}</p>
              )}
            </FormField>

            <FormField label="Style" id="style">
              <Select
                value={form.watch("style")}
                onValueChange={(v) => form.setValue("style", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.style && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.style.message}</p>
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Platform" id="targetPlatform">
              <Select
                value={form.watch("targetPlatform")}
                onValueChange={(v) => form.setValue("targetPlatform", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.targetPlatform && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.targetPlatform.message}</p>
              )}
            </FormField>

            <FormField label="Visual Style" id="visualStyle">
              <Select
                value={form.watch("visualStyle")}
                onValueChange={(v) => form.setValue("visualStyle", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualStyles.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.visualStyle && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.visualStyle.message}</p>
              )}
            </FormField>
          </div>

          <FormField label="Language" id="language">
            <Select
              value={form.watch("language")}
              onValueChange={(v) => form.setValue("language", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.language && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.language.message}</p>
            )}
          </FormField>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create & Generate
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
