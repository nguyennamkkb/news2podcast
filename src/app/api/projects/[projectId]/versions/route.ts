import { NextRequest } from "next/server";
import { getVersions, createVersion } from "@/lib/services/script-service";
import { ScriptSchema } from "@/lib/validators/script";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/utils/api-handler";

type Ctx = { params: Record<string, string> | Promise<Record<string, string>> };

export const GET = withErrorHandler(
  async (_req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;
    const versions = await getVersions(projectId);
    const parsedVersions = versions.map((v) => ({
      ...v,
      scriptData: typeof v.scriptData === "string" ? JSON.parse(v.scriptData) : v.scriptData,
    }));
    return apiSuccess(parsedVersions);
  }
);

export const POST = withErrorHandler(
  async (req: NextRequest, ctx: Ctx) => {
    const { projectId } = await ctx.params;
    const body = await req.json();

    const parsed = ScriptSchema.safeParse(body.scriptData);
    if (!parsed.success) {
      return apiError("Invalid script data", 400, parsed.error.issues);
    }

    const version = await createVersion(
      projectId,
      parsed.data,
      body.changelog
    );
    return apiSuccess(version, 201);
  }
);