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
    title: isArabic ? "أعمالنا ومنتجاتنا" : "Our Businesses & Products",
    description: isArabic
      ? "استكشف جميع الشركات والمنتجات ضمن منظومة أيه آر قدريكس."
      : "Explore every business and product across the AR Qudrix ecosystem.",
    alternates: { languages: { en: "/en/businesses", ar: "/ar/businesses" } },
  };
}

export default async function BusinessesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  const query = listBusinessesQuerySchema.parse({ locale, pageSize: 100 });
  const { items } = await businessService.listPublished(query);

  // ARCHIVED businesses are an internal-only state — never rendered publicly.
  const visibleItems = items.filter((b) => b.status !== "ARCHIVED");

  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {isArabic ? "منظومة أعمال أيه آر قدريكس" : "The AR Qudrix Business Ecosystem"}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          {isArabic
            ? "مجموعة من الشركات والمنتجات التقنية التي تشكل منظومة أيه آر قدريكس."
            : "A growing collection of technology-driven businesses and products under the AR Qudrix group."}
        </p>
      </header>

      {visibleItems.length === 0 ? (
        <p className="text-center text-slate-500">
          {isArabic ? "لا توجد أعمال منشورة بعد." : "No businesses have been published yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((business) => (
            <BusinessCard key={business.id} business={business} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
