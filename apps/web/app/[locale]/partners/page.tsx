import type { Metadata } from "next";
import Link from "next/link";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الشركاء" : "Partners" };
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "الشراكات" : "Partnerships"}
      </h1>
      <p className="mt-4 text-slate-600">
        {isArabic
          ? "نرحب بالشراكات الاستراتيجية عبر منظومة أعمال أيه آر قدريكس. تواصل معنا لمناقشة الفرص المحتملة."
          : "We welcome strategic partnerships across the AR Qudrix business ecosystem. Get in touch to discuss potential opportunities."}
      </p>

      <Link
        href={`/${locale}/contact`}
        className="mt-8 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-light"
      >
        {isArabic ? "تواصل معنا للشراكة" : "Contact Us About Partnering"}
      </Link>
    </main>
  );
}
