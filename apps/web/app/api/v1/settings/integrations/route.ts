import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { settingsService, updateIntegrationSettingsSchema } from "@arqudrix/domain";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const settings = await settingsService.getForAdmin({ id: session.user.id, role: session.user.role });
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = await request.json();
    const input = updateIntegrationSettingsSchema.parse(body);

    const updated = await settingsService.update(
      { id: session.user.id, role: session.user.role },
      input
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
