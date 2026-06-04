import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectListItem, ProjectDetail } from "@/types/project";

interface ProjectsResponse {
  projects: ProjectListItem[];
  total: number;
}

export function useProjects(filters?: { status?: string; search?: string; page?: number; limit?: number; sort?: string; order?: string }) {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));
      if (filters?.sort) params.set("sort", filters.sort);
      if (filters?.order) params.set("order", filters.order);
      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      return json.data as ProjectsResponse;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const json = await res.json();
      return json.data as ProjectDetail;
    },
    enabled: !!projectId,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}