import type { Script } from "./script";

export interface ProjectListItem {
  id: string;
  title: string;
  status: "DRAFT" | "QUEUED" | "GENERATING" | "COMPLETED" | "FAILED" | "ARCHIVED";
  targetDuration: number | null;
  slideCount: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectListItem {
  scriptData: Script | null;
  promptInput: string | null;
  style: string | null;
  language: string;
  targetPlatform: string;
  visualStyle: string;
  aiModel: string | null;
  aiTokensUsed: number | null;
  versions?: Array<{
    id: string;
    version: number;
    scriptData: Script;
    changelog: string | null;
    createdAt: string;
  }>;
}
