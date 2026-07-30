"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const formSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm({ locale }: { locale: "en" | "ar" }) {
  const isArabic = locale === "ar";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormValues) {
    const response = await fetch("/api/v1/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(
        body?.error === "INVALID_CURRENT_PASSWORD"
          ? isArabic
            ? "كلمة المرور الحالية غير صحيحة."
            : "Your current password is incorrect."
          : isArabic
            ? "تعذّر تحديث كلمة المرور."
            : "Failed to update password."
      );
      return;
    }

    toast.success(isArabic ? "تم تحديث كلمة المرور" : "Password updated");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {isArabic ? "تغيير كلمة المرور" : "Change Password"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "كلمة المرور الحالية" : "Current Password"}
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {isArabic ? "كلمة المرور الجديدة" : "New Password"}
        </label>
        <input
          type="password"
          {...register("newPassword")}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
      >
        {isSubmitting ? (isArabic ? "جارٍ التحديث…" : "Updating…") : isArabic ? "تحديث" : "Update Password"}
      </button>
    </form>
  );
}
