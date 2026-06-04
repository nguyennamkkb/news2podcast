"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { ProjectListItem } from "@/types/project";

const filters = ["ALL", "DRAFT", "QUEUED", "GENERATING", "COMPLETED", "FAILED"];

export function ProjectList() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProjects({ status: filter, search });
  const projects: ProjectListItem[] = data?.projects ?? [];

  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();

  const handleDelete = (id: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => {
        toast.success("Project deleted");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
      onError: () => {
        toast.error("Failed to delete project");
      },
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || filter !== "ALL"
              ? "Try adjusting your filters."
              : "Create your first video script project."}
          </p>
          {!search && filter === "ALL" && (
            <Button asChild>
              <a href="/projects/new">Create Project</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}