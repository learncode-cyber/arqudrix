import { NextResponse } from "next/server";
import { ForbiddenError } from "@arqudrix/auth";
import {
  BusinessNotFoundError,
  BusinessValidationError,
  ContentNotFoundError,
  ContentValidationError,
  UserManagementError,
  UserNotFoundError,
  LeadNotFoundError,
} from "@arqudrix/domain";
import { ZodError } from "zod";

/**
 * Maps thrown errors from the domain/application layer to HTTP responses.
 * Route handlers should wrap their logic in try/catch and call this in the
 * catch block — this keeps error-shape consistent for the admin UI's fetch
 * client and avoids leaking internal stack traces to the response body.
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: error.flatten() },
      { status: 422 }
    );
  }

  if (
    error instanceof BusinessValidationError ||
    error instanceof ContentValidationError ||
    error instanceof UserManagementError
  ) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: error.message }, { status: error.statusCode });
  }

  if (
    error instanceof BusinessNotFoundError ||
    error instanceof ContentNotFoundError ||
    error instanceof UserNotFoundError ||
    error instanceof LeadNotFoundError
  ) {
    return NextResponse.json({ error: "NOT_FOUND", message: error.message }, { status: error.statusCode });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: "FORBIDDEN", message: error.message }, { status: error.statusCode });
  }

  console.error("[api] Unhandled error:", error);
  return NextResponse.json(
    { error: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
