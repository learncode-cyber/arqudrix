import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { leadService, updateLeadStatusSchema } from "@arqudrix/domain";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const input = updateLeadStatusSchema.parse(body);

    const updated = await leadService.updateStatus(
      { id: session.user.id, role: session.user.role },
      id,
      input
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const { id } = await params;
    await leadService.delete({ id: session.user.id, role: session.user.role }, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
