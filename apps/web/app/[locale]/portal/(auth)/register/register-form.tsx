"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trackRegistrationConversion } from "@/lib/analytics/track";

const formSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterForm({ locale }: { locale: "en" | "ar" }) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormValues) {
    setServerError(null);

    const response = await fetch("/api/v1/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, locale }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setServerError(
        body?.error === "EMAIL_TAKEN"
          ? isArabic
            ? "يوجد حساب مسجّل بهذا البريد الإلكتروني بالفعل."
            : "An account with this email already exists."
          : isArabic
            ? "تعذّر إنشاء الحساب. يرجى المحاولة مرة أخرى."
            : "Could not create your account. Please try again."
      );
      return;
    }

    // Immediately sign the new user in and land them on the dashboard.
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    trackRegistrationConversion();
    router.push(`/${locale}/portal/dashboard`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "الاسم الكامل" : "Full Name"}</label>
        <input {...register("fullName")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
        <input type="email" {...register("email")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "كلمة المرور" : "Password"}</label>
        <input type="password" {...register("password")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
      >
        {isSubmitting ? (isArabic ? "جارٍ الإنشاء…" : "Creating account…") : isArabic ? "إنشاء حساب" : "Create Account"}
      </button>
    </form>
  );
}
