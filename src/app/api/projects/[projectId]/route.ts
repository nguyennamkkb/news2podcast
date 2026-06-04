import { NextRequest } from "next/server";
import { getProject, updateProject, deleteProject } from "@/lib/services/project-service";
import { updateProjectSchema } from "@/lib/validators/project";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/utils/api-handler";

type Ctx = { params: Record<string, string> | Promise<Record<string, string>> };

export const GET = withErrorHandler(
  async (_req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;
    const project = await getProject(projectId);

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiSuccess(project);
  }
);

export const PATCH = withErrorHandler(
  async (req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 400, parsed.error.issues);
    }

    const existing = await getProject(projectId);
    if (!existing) {
      return apiError("Project not found", 404);
    }

    const updated = await updateProject(projectId, parsed.data);
    return apiSuccess(updated);
  }
);

export const DELETE = withErrorHandler(
  async (_req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;

    const existing = await getProject(projectId);
    if (!existing) {
      return apiError("Project not found", 404);
    }

    await deleteProject(projectId);
    return apiSuccess({ deleted: true });
  }
);