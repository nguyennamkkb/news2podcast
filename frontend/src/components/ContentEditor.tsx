'use client';

import { useState, useRef } from 'react';

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

  const tabs: { id: InputMode; label: string; icon: string }[] = [
    { id: 'paste', label: 'Paste text', icon: '📋' },
    { id: 'upload-md', label: 'Upload .md', icon: '📁' },
    { id: 'upload-txt', label: 'Upload .txt', icon: '📄' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id); if (tab.id === 'paste') return; fileRef.current?.click(); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === tab.id
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-gray-400 hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <textarea
        value={value}
        onChange={(e) => { onChange(e.target.value); setMode('paste'); }}
        placeholder="Paste your markdown or plain text here..."
        className="w-full h-64 bg-bg-primary border-border rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue"
      />
      <div className="flex justify-between mt-2 text-sm text-gray-400">
        <span>Word count: {wordCount}</span>
        <span>Language: {language}</span>
      </div>
      {wordCount > 50000 && (
        <p className="mt-1 text-xs text-yellow-400">⚠️ Content is very long — video may exceed 5 minutes. Consider reducing.</p>
      )}
      {wordCount > 0 && wordCount < 10 && (
        <p className="mt-1 text-xs text-red-400">⚠️ Content too short — minimum 10 words required.</p>
      )}
    </div>
  );
}