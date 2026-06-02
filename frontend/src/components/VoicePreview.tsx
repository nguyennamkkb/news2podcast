"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface VoicePreviewProps {
  voiceId: string;
  label: string;
}

export function VoicePreview({ voiceId, label }: VoicePreviewProps) {
  const [playing, setPlaying] = useState(false);

  // Demo text per voice
  const demoTexts: Record<string, string> = {
    "vi-VN-HoaiMyNeural": "Xin chào, tôi là Hoài My, giọng đọc tin tức miền Bắc.",
    "vi-VN-NamMinhNeural": "Xin chào, tôi là Nam Minh, giọng đọc tin tức miền Bắc.",
    "en-US-JennyNeural": "Hello, I'm Jenny, your news anchor.",
    "en-US-GuyNeural": "Hello, I'm Guy, bringing you the latest updates.",
  };

  const handlePreview = () => {
    setPlaying(true);
    // In production, play a pre-generated sample
    const utterance = new SpeechSynthesisUtterance(demoTexts[voiceId] || `${label}`);
    utterance.lang = voiceId.startsWith("vi") ? "vi-VN" : "en-US";
    utterance.rate = 1.0;
    utterance.onend = () => setPlaying(false);
    speechSynthesis.speak(utterance);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handlePreview} disabled={playing} className="text-xs">
      {playing ? "🔊..." : "🔊 Preview"}
    </Button>
  );
}