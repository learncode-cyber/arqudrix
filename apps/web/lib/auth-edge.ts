import NextAuth from "next-auth";
import { edgeAuthConfig } from "@arqudrix/auth";

// Used exclusively by middleware.ts. Do NOT import this from route handlers
// or Server Components — it has no providers configured, so signIn() would
// fail. Use "@/lib/auth" (the full config) everywhere except middleware.
export const { auth } = NextAuth(edgeAuthConfig);
