import type { Metadata } from "next";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "الوظائف" : "Careers" };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "الوظائف في أيه آر قدريكس" : "Careers at AR Qudrix"}
      </h1>
      <p className="mt-4 text-slate-600">
        {isArabic
          ? "نبحث دائماً عن أشخاص موهوبين للانضمام إلى منظومتنا المتنامية."
          : "We're always looking for talented people to join our growing ecosystem."}
      </p>

      <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-slate-600">
          {isArabic
            ? "لا توجد وظائف شاغرة معلنة حالياً. تحقق مرة أخرى قريباً، أو راسلنا عبر صفحة التواصل."
            : "No open positions are listed right now. Check back soon, or reach out via our contact page."}
        </p>
      </div>
    </main>
  );
}
