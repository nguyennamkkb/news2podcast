import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, SidebarInset } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <ErrorBoundary>
          <TooltipProvider delayDuration={100}>
            <Providers>
              <SidebarProvider defaultOpen>
                <AppSidebar />
                <SidebarInset>{children}</SidebarInset>
              </SidebarProvider>
            </Providers>
          </TooltipProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
