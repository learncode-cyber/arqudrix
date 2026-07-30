import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { userManagementService, updateUserRoleSchema } from "@arqudrix/domain";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const input = updateUserRoleSchema.parse(body);

    const updated = await userManagementService.updateRole(
      { id: session.user.id, role: session.user.role },
      id,
      input
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
