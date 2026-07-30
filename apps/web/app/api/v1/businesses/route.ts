import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { businessService } from "@arqudrix/domain";
import { createBusinessSchema, listBusinessesQuerySchema } from "@arqudrix/domain";

// GET /api/v1/businesses — full admin listing, any status, any locale.
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listBusinessesQuerySchema.parse(searchParams);

    const result = await businessService.listForAdmin(
      { id: session.user.id, role: session.user.role },
      query
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

// POST /api/v1/businesses — create a new business/product card.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await request.json();
    const input = createBusinessSchema.parse(body);

    const created = await businessService.create(
      { id: session.user.id, role: session.user.role },
      input
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
