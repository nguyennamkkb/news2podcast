"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Zap,
  Menu,
} from "lucide-react";
import { FolderOpen } from "lucide-react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueueStatus } from "@/hooks/use-queue-status";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function QueueBadge() {
  const { data: status } = useQueueStatus();

  if (!status || status.activeCount === 0) return null;

  const isFull = status.activeCount >= status.maxConcurrent;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        isFull ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      )}
    >
      <Zap className="h-3 w-3" />
      {status.activeCount}/{status.maxConcurrent}
      {status.queueLength > 0 && <span>+{status.queueLength}</span>}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!collapsed && (
          <>
            <span className="font-bold text-lg">News2Podcast</span>
            <QueueBadge />
          </>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && item.label}
                </Button>
              </Link>
            );
          })}

          {!collapsed && <Separator className="my-2" />}

          {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            AI-powered news to podcast
          </p>
        </div>
      )}
    </aside>
  );
}