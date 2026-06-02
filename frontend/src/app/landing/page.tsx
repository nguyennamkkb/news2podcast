import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <PageHeader />
      <main className="flex flex-1 flex-col">
        <section className="text-center py-24 px-8">
          <h1 className="text-4xl md:text-6xl font-display font-black mb-6 bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
            Text to Video, Automatically
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Convert articles, blog posts, and news into professional video explainers with AI voiceover, karaoke subtitles, and smooth transitions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/new">
              <Button size="lg" className="gap-2">
                <Sparkles className="size-4" />
                Try It Free
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-8 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "AI-Powered Scripts", desc: "Smart summarization with Ollama Cloud LLM for natural, engaging scripts.", icon: "🤖" },
              { title: "Natural Voiceover", desc: "Free Edge TTS with Vietnamese and English voices, synced word-by-word.", icon: "🎤" },
              { title: "Professional Output", desc: "Clean dashboard, animated slides, fade transitions, 9:16 + 16:9 formats.", icon: "🎬" },
            ].map((f, i) => (
              <Card key={i}>
                <CardContent className="p-8 text-center">
                  <p className="text-4xl mb-4">{f.icon}</p>
                  <CardTitle className="text-lg mb-2">{f.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
