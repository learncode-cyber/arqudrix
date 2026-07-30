import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@arqudrix/db";
import { auth } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "NO_PASSWORD_SET", message: "This account has no password to change." },
        { status: 422 }
      );
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "INVALID_CURRENT_PASSWORD", message: "Your current password is incorrect." },
        { status: 422 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "user.password_changed",
        entityType: "User",
        entityId: session.user.id,
        metadata: {},
      },
    });

    return NextResponse.json({ status: "updated" }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 422 });
    }
    console.error("[api/v1/account/password] Unhandled error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
