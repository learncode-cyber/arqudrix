import NextAuth from "next-auth";
import { authConfig } from "@arqudrix/auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
