import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma, UserRole, UserStatus } from "@arqudrix/db";

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  locale: z.enum(["en", "ar"]).default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_TAKEN", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Public self-registration always creates a CUSTOMER — never an
    // elevated role. Elevation to CLIENT/PARTNER/SUPPLIER/INVESTOR (which
    // implies a verified business relationship) or any staff role
    // (EMPLOYEE+) can only be granted afterwards by a SUPER_ADMIN via the
    // admin Users page (see packages/domain/src/user/service.ts). This is
    // the RBAC invariant that prevents privilege escalation through
    // self-registration.
    //
    // Accounts are marked ACTIVE immediately. Email-verification-gated
    // activation (PENDING_VERIFICATION → ACTIVE via a confirmation link)
    // requires a transactional email provider, which is intentionally out
    // of scope until Phase 4 hardening — see README "Known gaps".
    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        locale: input.locale,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 422 });
    }

    console.error("[api/v1/register] Unhandled error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
