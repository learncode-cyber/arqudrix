import Link from "next/link";
import { PortalLoginForm } from "./login-form";

type Locale = "en" | "ar";

export const metadata = { title: "Sign In" };

export default async function PortalLoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          {isArabic ? "تسجيل الدخول إلى بوابة العملاء" : "Sign in to your portal"}
        </h1>
        <PortalLoginForm locale={locale} />
        <p className="mt-6 text-center text-sm text-slate-500">
          {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link href={`/${locale}/portal/register`} className="font-medium text-brand hover:underline">
            {isArabic ? "أنشئ حساباً" : "Create one"}
          </Link>
        </p>
      </div>
    </main>
  );
}
