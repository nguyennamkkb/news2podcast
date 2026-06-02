import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "News2Video - Text to Video AI",
  description: "Convert articles to professional news videos with AI voiceover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-white antialiased">
        <ErrorBoundary><Providers>{children}</Providers></ErrorBoundary>
      </body>
    </html>
  );
}