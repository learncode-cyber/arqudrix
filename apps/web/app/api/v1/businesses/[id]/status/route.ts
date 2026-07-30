import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { businessService, changeBusinessStatusSchema } from "@arqudrix/domain";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/businesses/:id/status — toggle ACTIVE / IN_DEVELOPMENT / PLANNED / ARCHIVED.
// Kept as a separate endpoint (rather than folded into the general PATCH) because
// status changes are a distinct, more sensitive business rule with their own
// audit trail (see BusinessStatusLog) — this mirrors how a real operations
// team would want to review "who flipped this to ACTIVE and when" in isolation.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = changeBusinessStatusSchema.parse(body);

    const updated = await businessService.changeStatus(
      { id: session.user.id, role: session.user.role },
      id,
      input
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
