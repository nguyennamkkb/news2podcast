"use client";

import { Button } from "@/components/ui/button";

const TRACKS = [
  { id: null, label: "None", icon: "🔇" },
  { id: "news-theme-1", label: "News Theme 1", icon: "🎵" },
  { id: "corporate", label: "Corporate", icon: "🏢" },
  { id: "upbeat", label: "Upbeat", icon: "⚡" },
];

interface BgMusicSelectorProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function BgMusicSelector({ selected, onSelect }: BgMusicSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TRACKS.map((track) => (
        <Button
          key={String(track.id)}
          variant={selected === track.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(track.id)}
          className={selected === track.id ? "bg-accent-blue" : ""}
        >
          {track.icon} {track.label}
        </Button>
      ))}
    </div>
  );
}