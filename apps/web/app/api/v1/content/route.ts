import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { contentService, createBlogPostSchema, listBlogPostsQuerySchema } from "@arqudrix/domain";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listBlogPostsQuerySchema.parse(searchParams);

    const result = await contentService.listForAdmin(
      { id: session.user.id, role: session.user.role },
      query
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = await request.json();
    const input = createBlogPostSchema.parse(body);

    const created = await contentService.create(
      { id: session.user.id, role: session.user.role },
      input
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
