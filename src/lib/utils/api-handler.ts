import { NextRequest } from "next/server";
import { apiError } from "./api-response";
import { ZodError } from "zod";

type Handler = (req: NextRequest, ctx: { params: Record<string, string> | Promise<Record<string, string>> }) => Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("Validation failed", 400, err.issues);
      }
      console.error("[API Error]", err);
      return apiError(
        err instanceof Error ? err.message : "Internal server error",
        500
      );
    }
  };
}