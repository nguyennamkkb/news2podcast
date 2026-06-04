"use client";

import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectList } from "@/components/projects/project-list";
import { GenerationQueueStatus } from "@/components/projects/generation-queue-status";
import { FolderOpen, Clock, Timer } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: projectsData } = useProjects();

  const projects = projectsData?.projects || [];
  const now = new Date();
  const thisMonth = projects.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const durations = projects
    .filter((p) => p.targetDuration != null)
    .map((p) => p.targetDuration!);

  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
      : 0;

  const stats = {
    total: projects.length,
    thisMonth,
    avgDuration,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <GenerationQueueStatus />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard icon={FolderOpen} label="Total Projects" value={stats.total} />
        <StatCard icon={Clock} label="This Month" value={stats.thisMonth} />
        <StatCard icon={Timer} label="Avg Duration" value={`${stats.avgDuration} min`} />
      </div>

      <ProjectList />
    </div>
  );
}