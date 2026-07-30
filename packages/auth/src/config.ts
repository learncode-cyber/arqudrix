import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma, UserStatus } from "@arqudrix/db";
import { z } from "zod";
import { edgeAuthConfig } from "./edge-config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Full Auth.js configuration — Node.js runtime ONLY (Route Handlers,
 * Server Components). Never import this file from middleware.ts; use
 * edge-config.ts there instead (see that file's header comment for why).
 *
 * Provider abstraction note (see ADR-002 — ARQ OS Central Identity):
 * Today authentication is local (email + password via the Credentials
 * provider). When ARQ OS exposes a Central Identity OIDC endpoint, add it
 * here as an additional entry in `providers` — no changes are required in
 * any consuming route handler or component, because every consumer reads
 * only from the resulting `session.user` shape defined in `callbacks`.
 */
export const authConfig: NextAuthConfig = {
  ...edgeAuthConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash) return null;
        if (user.status !== UserStatus.ACTIVE) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          locale: user.locale,
        };
      },
    }),
  ],
};
