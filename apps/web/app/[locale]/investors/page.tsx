import type { Metadata } from "next";
import Link from "next/link";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "المستثمرون" : "Investors" };
}

export default async function InvestorsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "المستثمرون" : "Investors"}
      </h1>
      <p className="mt-4 text-slate-600">
        {isArabic
          ? "لمعلومات حول فرص الاستثمار في منظومة أعمال أيه آر قدريكس، يرجى التواصل مباشرة مع فريقنا."
          : "For information about investment opportunities across the AR Qudrix business ecosystem, please contact our team directly."}
      </p>

      <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {isArabic
          ? "ملاحظة للمشغّل: هذه الصفحة تحتاج إلى معلومات مالية أو استثمارية معتمدة قبل النشر — لم يتم اختراع أي أرقام أو ادعاءات هنا."
          : "Operator note: this page needs approved financial/investment information before publishing — no figures or claims have been invented here."}
      </p>

      <Link
        href={`/${locale}/contact`}
        className="mt-8 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-light"
      >
        {isArabic ? "تواصل مع فريق الاستثمار" : "Contact the Investor Relations Team"}
      </Link>
    </main>
  );
}
