'use client';

import { useState } from 'react';
import { useVideoHistory } from '@/hooks/useVideoHistory';
import { HistoryTable } from '@/components/HistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';

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
    <>
      <PageHeader />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Card>
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
    </>
  );
}
