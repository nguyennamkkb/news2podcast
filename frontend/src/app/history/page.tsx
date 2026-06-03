'use client';

import { useState } from 'react';
import { useVideoHistory } from '@/hooks/useVideoHistory';
import { HistoryTable } from '@/components/HistoryTable';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

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
      <PageHeader>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Card>
            <CardContent className="pt-6">
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