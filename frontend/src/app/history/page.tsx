'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVideoHistory } from '@/hooks/useVideoHistory';
import { HistoryTable } from '@/components/HistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useVideoHistory(page, 20, statusFilter || undefined);

  const filteredVideos = (data?.videos ?? []).filter(v => {
    if (!searchQuery) return true;
    return (v.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-display font-black">History</h1>
          <div className="w-16" />
        </div>

        <Card className="bg-bg-secondary border-border">
          <CardHeader><CardTitle>Videos</CardTitle></CardHeader>
          <CardContent>
            <HistoryTable
              videos={filteredVideos}
              isLoading={isLoading}
              pagination={data?.pagination ?? null}
              page={page}
              onPageChange={setPage}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}