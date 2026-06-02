'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/new', label: 'New Video' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-muted/80 backdrop-blur-sm sticky top-0">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-display font-black text-foreground hover:text-primary transition-colors">
          News2Video
        </Link>

        {/* Desktop nav */}
        <Tabs value={pathname} className="hidden md:block">
          <TabsList>
            {NAV_ITEMS.map(item => (
              <TabsTrigger key={item.href} value={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden text-muted-foreground hover:text-foreground p-1">
            {mobileOpen ? '✕' : '☰'}
          </SheetTrigger>
          <SheetContent side="top" className="md:hidden">
            <Tabs value={pathname} className="w-full">
              <TabsList className="flex flex-col w-full gap-1">
                {NAV_ITEMS.map(item => (
                  <TabsTrigger key={item.href} value={item.href} asChild className="w-full justify-start">
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}