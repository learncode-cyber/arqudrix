"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, type CreateLeadInput } from "@arqudrix/domain";
import { trackLeadConversion } from "@/lib/analytics/track";

export function ContactForm({ locale }: { locale: "en" | "ar" }) {
  const isArabic = locale === "ar";
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: { locale },
  });

  async function onSubmit(data: CreateLeadInput) {
    setSubmitError(null);

    const response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setSubmitError(
        isArabic
          ? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى."
          : "Something went wrong sending your message. Please try again."
      );
      return;
    }

    setSubmitted(true);
    reset();
    trackLeadConversion();
  }

  if (submitted) {
    return (
      <div className="rounded-md bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        {isArabic
          ? "شكراً لتواصلك معنا! سيقوم فريقنا بالرد عليك قريباً."
          : "Thank you for reaching out! Our team will respond shortly."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir={isArabic ? "rtl" : "ltr"}>
      {/* Honeypot — hidden from real users via CSS, bots tend to fill every field */}
      <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "الاسم الكامل" : "Full Name"}
        </label>
        <input {...register("fullName")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "البريد الإلكتروني" : "Email"}
        </label>
        <input type="email" {...register("email")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "الشركة (اختياري)" : "Company (optional)"}
        </label>
        <input {...register("company")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "الرسالة" : "Message"}
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
      >
        {isSubmitting ? (isArabic ? "جارٍ الإرسال…" : "Sending…") : isArabic ? "إرسال" : "Send Message"}
      </button>
    </form>
  );
}
