import Link from "next/link";
import { RegisterForm } from "./register-form";

type Locale = "en" | "ar";

export const metadata = { title: "Create Account" };

export default async function PortalRegisterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          {isArabic ? "إنشاء حساب في البوابة" : "Create your portal account"}
        </h1>
        <RegisterForm locale={locale} />
        <p className="mt-6 text-center text-sm text-slate-500">
          {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link href={`/${locale}/portal/login`} className="font-medium text-brand hover:underline">
            {isArabic ? "سجّل الدخول" : "Sign in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
