"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function PortalLoginForm({ locale }: { locale: "en" | "ar" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });
    setIsSubmitting(false);

    if (result?.error) {
      setError(isArabic ? "بيانات الدخول غير صحيحة." : "Invalid email or password.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? `/${locale}/portal/dashboard`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "كلمة المرور" : "Password"}</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
      >
        {isSubmitting ? (isArabic ? "جارٍ الدخول…" : "Signing in…") : isArabic ? "تسجيل الدخول" : "Sign In"}
      </button>
    </form>
  );
}
