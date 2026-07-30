"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createInquirySchema, type CreateInquiryInput } from "@arqudrix/domain";
import { InquiryType } from "@arqudrix/db";

export function NewInquiryForm({ locale }: { locale: "en" | "ar" }) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: { type: InquiryType.GENERAL },
  });

  async function onSubmit(data: CreateInquiryInput) {
    const response = await fetch("/api/v1/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      toast.error(isArabic ? "تعذّر إرسال الاستفسار." : "Failed to submit inquiry.");
      return;
    }

    toast.success(isArabic ? "تم إرسال استفسارك" : "Your inquiry has been submitted");
    reset();
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="h-fit rounded-lg border border-dashed border-slate-300 px-5 py-4 text-sm font-medium text-brand hover:bg-slate-50"
      >
        + {isArabic ? "استفسار جديد" : "New Inquiry"}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-fit space-y-4 rounded-lg border border-slate-200 bg-white p-5"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "النوع" : "Type"}</label>
        <select {...register("type")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {Object.values(InquiryType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "الموضوع" : "Subject"}</label>
        <input {...register("subject")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">{isArabic ? "التفاصيل" : "Details"}</label>
        <textarea {...register("body")} rows={5} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
        >
          {isSubmitting ? (isArabic ? "جارٍ الإرسال…" : "Submitting…") : isArabic ? "إرسال" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {isArabic ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </form>
  );
}
