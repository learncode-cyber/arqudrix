import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { inquiryService, createInquirySchema, listInquiriesQuerySchema } from "@arqudrix/domain";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listInquiriesQuerySchema.parse(searchParams);

    const result = await inquiryService.listOwn(
      { id: session.user.id, role: session.user.role },
      query
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 422 });
    }
    console.error("[api/v1/inquiries] Unhandled error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = await request.json();
    const input = createInquirySchema.parse(body);

    const created = await inquiryService.create(
      { id: session.user.id, role: session.user.role },
      input
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 422 });
    }
    console.error("[api/v1/inquiries] Unhandled error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
