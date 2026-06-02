'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ClipboardPaste, FileUp, FileText } from 'lucide-react';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  wordCount: number;
  language: string;
}

type InputMode = 'paste' | 'upload-md' | 'upload-txt';

export function ContentEditor({ value, onChange, wordCount, language }: ContentEditorProps) {
  const [mode, setMode] = useState<InputMode>('paste');
  const fileRef = useRef<HTMLInputElement>(null);
  const isInvalid = wordCount > 0 && wordCount < 10;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsText(file);
    setMode(file.name.endsWith('.txt') ? 'upload-txt' : 'upload-md');
  };

  const handleModeChange = (val: string) => {
    if (!val) return;
    if (val !== 'paste') {
      fileRef.current?.click();
    }
    setMode(val as InputMode);
  };

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={handleModeChange}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="paste" className="gap-1.5">
          <ClipboardPaste className="size-3.5" />
          Paste text
        </ToggleGroupItem>
        <ToggleGroupItem value="upload-md" className="gap-1.5">
          <FileUp className="size-3.5" />
          Upload .md
        </ToggleGroupItem>
        <ToggleGroupItem value="upload-txt" className="gap-1.5">
          <FileText className="size-3.5" />
          Upload .txt
        </ToggleGroupItem>
      </ToggleGroup>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex flex-col gap-2" data-invalid={isInvalid || undefined}>
        <Textarea
          id="content-editor"
          value={value}
          onChange={(e) => { onChange(e.target.value); setMode('paste'); }}
          placeholder="Paste your markdown or plain text here..."
          className="h-64 font-mono text-sm resize-none"
          aria-invalid={isInvalid}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Word count: {wordCount}</span>
          <span>Language: {language}</span>
        </div>
        {wordCount > 50000 && (
          <p className="text-xs text-amber-500">Content is very long — video may exceed 5 minutes. Consider reducing.</p>
        )}
        {isInvalid && (
          <p className="text-xs text-destructive">Content too short — minimum 10 words required.</p>
        )}
      </div>
    </div>
  );
}