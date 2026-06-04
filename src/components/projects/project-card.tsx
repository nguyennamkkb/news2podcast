"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "./project-status-badge";
import { MoreHorizontal, Pencil, Trash2, Clock } from "lucide-react";
import type { ProjectListItem } from "@/types/project";
import { formatDuration, timeAgo } from "@/lib/utils/format";

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                <ProjectStatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {project.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/projects/${project.id}`;
                }}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete?.(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {project.slideCount != null && (
              <span>{project.slideCount} slides</span>
            )}
            {project.targetDuration && (
              <span>{formatDuration(project.targetDuration)}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(project.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
