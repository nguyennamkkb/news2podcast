"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/hooks/use-projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ScriptGeneratePanel } from "@/components/script/script-generate-panel";
import { ScriptTimeline } from "@/components/script/script-timeline";
import { SlideEditor } from "@/components/script/slide-editor";
import { ScriptExport } from "@/components/script/script-export";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectDetail } from "@/types/project";
import type { Slide, Script } from "@/types/script";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const queryClient = useQueryClient();

  const slideSaveMutation = useMutation({
    mutationFn: async ({ pid, scriptData }: { pid: string; scriptData: Script }) => {
      const res = await fetch(`/api/projects/${pid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptData }),
      });
      if (!res.ok) throw new Error("Failed to save slide");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Slide updated");
    },
    onError: () => {
      toast.error("Failed to save slide");
    },
  });

  const handleGenerateComplete = (script: Script) => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    toast.success("Script generated successfully!");
  };

  const handleSlideSave = (slide: Slide) => {
    if (!project?.scriptData) return;
    const updatedScript = {
      ...project.scriptData,
      slides: project.scriptData.slides.map((s) => (s.id === slide.id ? slide : s)),
    };
    slideSaveMutation.mutate({ pid: projectId, scriptData: updatedScript });
  };

  const fetchProject = () => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Project not found</h2>
      </div>
    );
  }

  const script = project.scriptData as Script | null;
  const canGenerate = project.status === "DRAFT" || project.status === "FAILED";

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
        {project.slideCount != null && <span>{project.slideCount} slides</span>}
        {project.targetDuration && (
          <span>{Math.floor(project.targetDuration / 60)} min</span>
        )}
        {project.language && <Badge variant="outline">{project.language}</Badge>}
      </div>

      {canGenerate && (
        <ScriptGeneratePanel
          projectId={projectId}
          currentStatus={project.status}
          onGenerateStart={fetchProject}
          onGenerateComplete={handleGenerateComplete}
        />
      )}

      {project.status === "QUEUED" && !canGenerate && (
        <ScriptGeneratePanel
          projectId={projectId}
          currentStatus={project.status}
          onGenerateStart={fetchProject}
          onGenerateComplete={handleGenerateComplete}
        />
      )}

      {project.status === "GENERATING" && (
        <ScriptGeneratePanel
          projectId={projectId}
          currentStatus={project.status}
          onGenerateStart={fetchProject}
          onGenerateComplete={handleGenerateComplete}
        />
      )}

      {script ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <ScriptExport script={script} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const panel = document.querySelector("[data-generate-panel]");
                panel?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Regenerate
            </Button>
          </div>

          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <ScriptTimeline
                slides={script.slides}
                onEditSlide={setEditingSlide}
              />
            </TabsContent>

            <TabsContent value="slides" className="mt-4 space-y-4">
              {script.slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setEditingSlide(slide)}
                >
                  <span className="text-sm font-mono text-muted-foreground w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{slide.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {slide.content}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">{slide.type}</Badge>
                  <span className="text-xs text-muted-foreground">{slide.duration}s</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[600px]">
                {JSON.stringify(script, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              {project.versions && project.versions.length > 0 ? (
                <div className="space-y-2">
                  {project.versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">v{v.version}</span>
                        <span className="text-sm text-muted-foreground ml-3">
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                        {v.changelog && (
                          <p className="text-xs text-muted-foreground mt-0.5">{v.changelog}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No versions saved yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        project.status === "DRAFT" && !canGenerate && (
          <div className="text-center py-8 text-muted-foreground">
            Click &ldquo;Generate Script&rdquo; to create your video script.
          </div>
        )
      )}

      {editingSlide && (
        <SlideEditor
          slide={editingSlide}
          open={!!editingSlide}
          onClose={() => setEditingSlide(null)}
          onSave={handleSlideSave}
        />
      )}
    </div>
  );
}