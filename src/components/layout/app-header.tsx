"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useQueueStatus } from "@/hooks/use-queue-status";

function breadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      href,
    });
  }
  return crumbs;
}

export function AppHeader() {
  const pathname = usePathname();
  const crumbs = breadcrumbs(pathname);
  const { data: queueData } = useQueueStatus();
  const queueFull = queueData ? queueData.activeCount >= queueData.maxConcurrent : false;

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <span>/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/projects/new">
          <Button disabled={queueFull} size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>
    </header>
  );
}