import { NextRequest } from "next/server";
import { listProjects, createProject } from "@/lib/services/project-service";
import { createProjectSchema } from "@/lib/validators/project";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/utils/api-handler";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const result = await listProjects({ status, search, page, limit, sort, order });
  return apiSuccess(result);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.issues);
  }

  const project = await createProject(parsed.data);
  return apiSuccess(project, 201);
});