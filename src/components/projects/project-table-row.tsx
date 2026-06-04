"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "./project-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2, Play } from "lucide-react";
import type { ProjectListItem } from "@/types/project";
import { formatDuration, timeAgo } from "@/lib/utils/format";

interface ProjectTableRowProps {
  project: ProjectListItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectTableRow({ project, selected, onSelect, onDelete }: ProjectTableRowProps) {
  const canGenerate = project.status === "DRAFT" || project.status === "FAILED";

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-3 w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(project.id)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="p-3">
        <Link
          href={`/projects/${project.id}`}
          className="font-medium text-sm hover:text-primary transition-colors"
        >
          {project.title}
        </Link>
      </td>
      <td className="p-3">
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {project.slideCount ?? "--"}
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {formatDuration(project.targetDuration)}
      </td>
      <td className="p-3 text-sm text-muted-foreground">
        {timeAgo(project.createdAt)}
      </td>
      <td className="p-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>
                <Eye className="h-4 w-4 mr-2" /> View
              </Link>
            </DropdownMenuItem>
            {canGenerate && (
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Play className="h-4 w-4 mr-2" /> Generate
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
