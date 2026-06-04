import { prisma } from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators/project";

export async function listProjects(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  const { status, search, page = 1, limit = 20, sort = "createdAt", order = "desc" } = params;
  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    where.title = { contains: search };
  }

  const allowedSorts: Record<string, string> = {
    title: "title",
    status: "status",
    createdAt: "createdAt",
    slideCount: "slideCount",
    targetDuration: "targetDuration",
  };
  const sortField = allowedSorts[sort] || "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        targetDuration: true,
        slideCount: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        scriptData: true,
        promptInput: true,
        style: true,
        language: true,
        targetPlatform: true,
        visualStyle: true,
        aiModel: true,
        aiTokensUsed: true,
      },
    }),
    prisma.project.count({ where }),
  ]);

  const projectsWithParsedData = projects.map((p) => ({
    ...p,
    scriptData: p.scriptData ? (() => { try { return JSON.parse(p.scriptData); } catch { return null; } })() : null,
  }));

  return { projects: projectsWithParsedData, total, page, limit };
}

export async function getProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 5,
      },
    },
  });

  if (!project) return null;

  return {
    ...project,
    scriptData: project.scriptData ? (() => { try { return JSON.parse(project.scriptData); } catch { return null; } })() : null,
    versions: project.versions.map((v) => ({
      ...v,
      scriptData: v.scriptData ? (() => { try { return JSON.parse(v.scriptData); } catch { return null; } })() : null,
    })),
  };
}

export async function createProject(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      title: data.title,
      description: data.description || null,
      promptInput: data.promptInput,
      targetDuration: data.targetDuration,
      style: data.style || null,
      language: data.language || "vi",
      targetPlatform: data.targetPlatform || "youtube",
      visualStyle: data.visualStyle || "cinematic",
      status: "DRAFT",
    },
  });
}

export async function updateProject(projectId: string, data: UpdateProjectInput) {
  const updateData: Record<string, unknown> = { ...data };
  if (updateData.scriptData) {
    updateData.scriptData = JSON.stringify(updateData.scriptData);
  }
  return prisma.project.update({
    where: { id: projectId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: updateData as any,
  });
}

export async function deleteProject(projectId: string) {
  return prisma.project.delete({
    where: { id: projectId },
  });
}
