"use client";

import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UsageStats() {
  const { data, isLoading } = useProjects();

  const projects = data?.projects || [];

  const stats = isLoading ? null : {
    totalProjects: projects.length,
    totalSlides: projects.reduce((sum: number, p: { slideCount: number | null }) => sum + (p.slideCount || 0), 0),
    completedProjects: projects.filter((p: { status: string }) => p.status === "COMPLETED").length,
    failedProjects: projects.filter((p: { status: string }) => p.status === "FAILED").length,
  };

  if (!stats) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Usage</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Usage</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total projects</span>
          <span className="font-medium">{stats.totalProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Completed</span>
          <span className="font-medium text-green-600">{stats.completedProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Failed</span>
          <span className="font-medium text-red-600">{stats.failedProjects}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total slides</span>
          <span className="font-medium">{stats.totalSlides}</span>
        </div>
      </CardContent>
    </Card>
  );
}