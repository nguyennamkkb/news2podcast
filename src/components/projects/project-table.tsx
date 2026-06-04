"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectTableRow } from "./project-table-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import type { ProjectListItem } from "@/types/project";

const filters = ["ALL", "DRAFT", "QUEUED", "GENERATING", "COMPLETED", "FAILED"];

const columns = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "slideCount", label: "Slides" },
  { key: "targetDuration", label: "Duration" },
  { key: "createdAt", label: "Created" },
] as const;

export function ProjectTable() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const limit = 20;

  const { data, isLoading } = useProjects({ status: filter, search, sort, order, page, limit });
  const projects: ProjectListItem[] = data?.projects ?? [];
  const total = data?.total ?? 0;

  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();

  const handleSort = (key: string) => {
    if (sort === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selected.size === projects.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(projects.map((p: ProjectListItem) => p.id)));
    }
  };

  const handleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

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

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await deleteProject.mutateAsync(id).catch(() => {
        toast.error(`Failed to delete project ${id}`);
      });
    }
    setSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    toast.success("Selected projects deleted");
  };

  const totalPages = Math.ceil(total / limit);

  const SortIcon = ({ column }: { column: string }) => {
    if (sort !== column) return <ChevronsUpDown className="h-3 w-3 inline ml-1 opacity-30" />;
    return order === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
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
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
          <span className="text-sm">{selected.size} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === projects.length && projects.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon column={col.key} />
                </th>
              ))}
              <th className="p-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="p-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search || filter !== "ALL"
                      ? "No projects match your filters."
                      : "No projects yet. Create your first one!"}
                  </p>
                </td>
              </tr>
            ) : (
              projects.map((project: ProjectListItem) => (
                <ProjectTableRow
                  key={project.id}
                  project={project}
                  selected={selected.has(project.id)}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {projects.length} of {total} projects
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Prev
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={page === p ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}