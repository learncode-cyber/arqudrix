import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible base Auth.js config.
 *
 * Next.js middleware runs on the Edge runtime by default, which cannot use
 * Node.js-only APIs — this rules out bcrypt (native bindings) and the
 * Prisma adapter (TCP database driver) inside middleware.
 *
 * This file therefore contains ONLY what middleware needs: the JWT/session
 * shape callbacks and the `authorized` check used to decide whether a
 * request has a valid session. It deliberately has no `providers` array —
 * you cannot call `signIn()` against this config, only read `req.auth`.
 *
 * The full config (packages/auth/src/config.ts) imports this file and adds
 * the Prisma adapter + Credentials provider on top, for use exclusively in
 * Node.js-runtime contexts: Route Handlers and Server Components.
 */
export const edgeAuthConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.locale = (user as { locale?: string }).locale;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as never;
        session.user.locale = token.locale as string;
      }
      return session;
    },
  },
};
