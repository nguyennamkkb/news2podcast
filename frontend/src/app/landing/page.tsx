import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="text-center py-32 px-8">
        <h1 className="text-5xl md:text-7xl font-display font-black mb-6 bg-gradient-to-r from-accent-blue to-accent-teal bg-clip-text text-transparent">
          Text to Video, Automatically
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Convert articles, blog posts, and news into professional video explainers with AI voiceover, karaoke subtitles, and smooth transitions — in seconds.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/app">
            <Button size="lg" className="bg-accent-blue hover:bg-accent-blue/80 text-lg px-8 py-6">
              Try It Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-32">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "AI-Powered Scripts", desc: "Smart summarization with Ollama Cloud LLM for natural, engaging scripts.", icon: "🤖" },
            { title: "Natural Voiceover", desc: "Free Edge TTS with Vietnamese and English voices, synced word-by-word.", icon: "🎤" },
            { title: "Professional Output", desc: "Dark theme, animated slides, fade transitions, 9:16 + 16:9 formats.", icon: "🎬" },
          ].map((f, i) => (
            <div key={i} className="bg-bg-secondary border border-border rounded-xl p-8 text-center">
              <p className="text-4xl mb-4">{f.icon}</p>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}