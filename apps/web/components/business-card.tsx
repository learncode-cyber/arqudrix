import Link from "next/link";
import Image from "next/image";
import type { Business, BusinessTranslation } from "@arqudrix/db";
import { StatusBadge } from "./status-badge";

type CardBusiness = Business & { translations: Pick<BusinessTranslation, "locale" | "name" | "tagline">[] };

export function BusinessCard({ business, locale }: { business: CardBusiness; locale: "en" | "ar" }) {
  const translation = business.translations.find((t) => t.locale === locale) ?? business.translations[0];

  if (!translation) return null;

  return (
    <Link
      href={`/${locale}/businesses/${business.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 w-full bg-slate-100">
        {business.coverImageUrl ? (
          <Image
            src={business.coverImageUrl}
            alt={translation.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-bold text-slate-300">
            {translation.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand">{translation.name}</h3>
          <StatusBadge status={business.status} locale={locale} />
        </div>
        <p className="text-sm text-slate-600">{translation.tagline}</p>
        <span className="mt-auto text-sm font-medium text-brand">
          {locale === "ar" ? "عرض التفاصيل ←" : "View details →"}
        </span>
      </div>
    </Link>
  );
}
