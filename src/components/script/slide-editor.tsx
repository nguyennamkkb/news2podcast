"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Slide, TransitionType } from "@/types/script";

const transitionOptions: TransitionType[] = [
  "fade", "slide_left", "slide_right", "slide_up", "slide_down",
  "zoom_in", "zoom_out", "dissolve", "none",
];

interface SlideEditorProps {
  slide: Slide;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Slide) => void;
}

export function SlideEditor({ slide, open, onClose, onSave }: SlideEditorProps) {
  const [edited, setEdited] = useState<Slide>({ ...slide });

  const handleSave = () => {
    onSave(edited);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Slide {slide.id.replace("slide-", "")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={edited.title}
              onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Content</Label>
            <Textarea
              value={edited.content}
              onChange={(e) => setEdited({ ...edited, content: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-1">
            <Label>Subtitle</Label>
            <Input
              value={edited.subtitle || ""}
              onChange={(e) => setEdited({ ...edited, subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Visual Description</Label>
            <Textarea
              value={edited.visualDescription}
              onChange={(e) => setEdited({ ...edited, visualDescription: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Duration (s)</Label>
              <Input
                type="number"
                value={edited.duration}
                min={5}
                max={120}
                onChange={(e) => setEdited({ ...edited, duration: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div className="space-y-1">
              <Label>Transition</Label>
              <Select
                value={edited.transition}
                onValueChange={(v) => setEdited({ ...edited, transition: v as TransitionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transitionOptions.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              value={edited.notes || ""}
              onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
