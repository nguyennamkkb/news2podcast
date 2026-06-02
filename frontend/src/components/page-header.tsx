'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const CRUMB_MAP: Record<string, { label: string; href: string }[]> = {
  '/': [{ label: 'Dashboard', href: '/' }],
  '/new': [
    { label: 'Dashboard', href: '/' },
    { label: 'New Video', href: '/new' },
  ],
  '/history': [
    { label: 'Dashboard', href: '/' },
    { label: 'History', href: '/history' },
  ],
  '/settings': [
    { label: 'Dashboard', href: '/' },
    { label: 'Settings', href: '/settings' },
  ],
};

export function PageHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();

  let crumbs = CRUMB_MAP[pathname];
  if (!crumbs && pathname.startsWith('/video/')) {
    crumbs = [
      { label: 'Dashboard', href: '/' },
      { label: 'Video Detail', href: pathname },
    ];
  }
  if (!crumbs) crumbs = [{ label: 'Dashboard', href: '/' }];

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-all duration-300 ease-in-out">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className={i > 0 ? 'hidden md:block' : ''}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
