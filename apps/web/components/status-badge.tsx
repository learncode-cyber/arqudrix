import type { BusinessStatus } from "@arqudrix/db";

const STATUS_LABEL: Record<BusinessStatus, { en: string; ar: string; className: string }> = {
  ACTIVE: { en: "Active", ar: "نشط", className: "bg-emerald-100 text-emerald-800" },
  IN_DEVELOPMENT: { en: "In Development", ar: "قيد التطوير", className: "bg-amber-100 text-amber-800" },
  PLANNED: { en: "Planned", ar: "مخطط له", className: "bg-slate-100 text-slate-600" },
  ARCHIVED: { en: "Archived", ar: "مؤرشف", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status, locale }: { status: BusinessStatus; locale: "en" | "ar" }) {
  const { en, ar, className } = STATUS_LABEL[status];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {locale === "ar" ? ar : en}
    </span>
  );
}
