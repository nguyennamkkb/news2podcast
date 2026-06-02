"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-display font-black">Settings</h1>
          <div className="w-16" />
        </div>
        <Card className="bg-bg-secondary border-border">
          <CardHeader><CardTitle>Ollama Cloud</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Configure your Ollama Cloud endpoint for LLM summarization.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}