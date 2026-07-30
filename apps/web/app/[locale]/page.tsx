import Link from "next/link";
import type { Metadata } from "next";
import { businessService, listBusinessesQuerySchema } from "@arqudrix/domain";
import { BusinessCard } from "@/components/business-card";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "الرئيسية" : "Home",
    description: isArabic
      ? "أيه آر قدريكس — مجموعة تقنية وأعمال عالمية تجمع بين الابتكار والذكاء الاصطناعي."
      : "AR Qudrix — a global technology and business group combining innovation and AI orchestration.",
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const query = listBusinessesQuerySchema.parse({ locale, pageSize: 6 });
  const { items } = await businessService.listPublished(query);
  const featured = items.filter((b) => b.isFeatured && b.status !== "ARCHIVED").slice(0, 3);

  return (
    <main>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {isArabic ? "أيه آر قدريكس" : "AR Qudrix"}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          {isArabic
            ? "مجموعة تقنية وأعمال عالمية تجمع بين الذكاء الاصطناعي والابتكار عبر مجموعة متنامية من الشركات."
            : "A global technology and business group bringing AI orchestration and innovation across a growing family of businesses."}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`/${locale}/businesses`}
            className="rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-light"
          >
            {isArabic ? "استكشف أعمالنا" : "Explore Our Businesses"}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="rounded-md border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">
            {isArabic ? "أعمال مميزة" : "Featured Businesses"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((business) => (
              <BusinessCard key={business.id} business={business} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
