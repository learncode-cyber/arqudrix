import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-errors";
import { contentService, updateBlogPostSchema } from "@arqudrix/domain";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const { id } = await params;
    const post = await contentService.getByIdForAdmin(
      { id: session.user.id, role: session.user.role },
      id
    );

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const input = updateBlogPostSchema.parse(body);

    const updated = await contentService.update(
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
    await contentService.delete({ id: session.user.id, role: session.user.role }, id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
