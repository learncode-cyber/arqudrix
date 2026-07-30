import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { userManagementService, listUsersQuerySchema } from "@arqudrix/domain";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listUsersQuerySchema.parse(searchParams);

    const result = await userManagementService.list(
      { id: session.user.id, role: session.user.role },
      query
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
