"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewVideoPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [voice, setVoice] = useState("vi-VN-HoaiMyNeural");
  const [format, setFormat] = useState<"9x16" | "16x9">("9x16");
  const [slideCount, setSlideCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (wordCount < 10) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          config: { voice, format, outputs: ["9x16", "16x9"], target_duration_sec: 60, slide_count: slideCount, background_music: null },
        }),
      });
      const data = await res.json();
      router.push(`/video/${data.job_id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
          <h1 className="text-2xl font-display font-black">New Video</h1>
          <div className="w-16" />
        </div>

        <Card className="bg-bg-secondary border-border mb-6">
          <CardHeader><CardTitle>Content</CardTitle></CardHeader>
          <CardContent>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your markdown or plain text here..."
              className="w-full h-64 bg-bg-primary border-border rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Word count: {wordCount}</span>
              <span>Language: {content.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i) ? "Vietnamese" : "English"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border mb-6">
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Voice</label>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-bg-primary border-border rounded-lg p-3 text-white">
                <option value="vi-VN-HoaiMyNeural">Nữ miền Bắc (Hoài My)</option>
                <option value="vi-VN-NamMinhNeural">Nam miền Bắc (Nam Minh)</option>
                <option value="en-US-JennyNeural">Female US (Jenny)</option>
                <option value="en-US-GuyNeural">Male US (Guy)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Format</label>
              <div className="flex gap-2">
                {(["9x16", "16x9"] as const).map((f) => (
                  <Button key={f} variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)} className={format === f ? "bg-accent-blue" : ""}>
                    {f === "9x16" ? "📱 9:16 (TikTok)" : "🖥️ 16:9 (YouTube)"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Slides: {slideCount}</label>
              <input type="range" min={3} max={8} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500"><span>3</span><span>8</span></div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full bg-accent-blue hover:bg-accent-blue/80" onClick={handleSubmit} disabled={isSubmitting || wordCount < 10}>
          {isSubmitting ? "Generating..." : "⚡ Generate Video"}
        </Button>
      </div>
    </main>
  );
}