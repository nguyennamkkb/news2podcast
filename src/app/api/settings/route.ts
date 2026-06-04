import { NextRequest } from "next/server";
import { getAllSettings, updateSettings } from "@/lib/services/settings-service";
import { updateSettingsSchema } from "@/lib/validators/settings";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const settings = await getAllSettings();
  return Response.json(settings);
});

export const PUT = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.issues);
  }
  const settings = await updateSettings(parsed.data);
  return Response.json(settings);
});