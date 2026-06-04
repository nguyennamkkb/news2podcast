"use client";

import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import type { Script } from "@/types/script";
import { useState } from "react";

interface ScriptExportProps {
  script: Script;
}

export function ScriptExport({ script }: ScriptExportProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(script, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(script, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-1" /> Download JSON
      </Button>
      <Button size="sm" variant="outline" onClick={handleCopy}>
        {copied ? (
          <Check className="h-4 w-4 mr-1 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 mr-1" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
