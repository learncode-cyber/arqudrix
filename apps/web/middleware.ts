import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-edge";

const SUPPORTED_LOCALES = ["en", "ar"] as const;
const DEFAULT_LOCALE = "en";
const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/register"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function detectPreferredLocale(acceptLanguage: string): string {
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
  return SUPPORTED_LOCALES.includes(preferred as never) ? preferred! : DEFAULT_LOCALE;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // The admin panel lives outside the locale-prefixed tree entirely
  // (/admin/*, not /en/admin/* or /ar/admin/*) — it's an internal tool, not
  // part of the public multi-language site, so it skips locale routing.
  if (pathname.startsWith("/admin")) {
    const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));
    if (!isPublicAdminPath && !request.auth) {
      const loginUrl = new URL("/admin/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Role-level gating (only EMPLOYEE+ may proceed past login) happens in
    // app/admin/(dashboard)/layout.tsx, which has access to the full
    // session including `role` — middleware here only checks "is there any
    // valid session at all" using the Edge-safe JWT check.
    return NextResponse.next();
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = detectPreferredLocale(request.headers.get("accept-language") ?? "");
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Strip the locale prefix to check the underlying route.
  const pathWithoutLocale = "/" + pathname.split("/").slice(2).join("/");
  const isPortalRoute = pathWithoutLocale.startsWith("/portal");
  const isPublicPortalPath = PUBLIC_PORTAL_PATHS.some((path) => pathWithoutLocale.startsWith(path));

  if (isPortalRoute && !isPublicPortalPath && !request.auth) {
    const locale = pathname.split("/")[1];
    const loginUrl = new URL(`/${locale}/portal/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
