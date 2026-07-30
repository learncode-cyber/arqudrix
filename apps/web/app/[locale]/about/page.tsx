import type { Metadata } from "next";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "من نحن" : "About AR Qudrix",
    description: isArabic
      ? "تعرف على مجموعة أيه آر قدريكس، رؤيتها، ومنظومة أعمالها."
      : "Learn about the AR Qudrix group, its mission, and its business ecosystem.",
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "من نحن" : "About AR Qudrix"}
      </h1>

      <div className="prose prose-slate mt-8 max-w-none" dir={isArabic ? "rtl" : "ltr"}>
        {isArabic ? (
          <>
            <p>
              أيه آر قدريكس هي مجموعة أعمال وتقنية عالمية تجمع بين عدة كيانات تجارية تحت مظلة واحدة، بدعم من
              منصة ذكاء اصطناعي مركزية.
            </p>
            <p>
              [ملاحظة للمشغّل: هذا القسم يحتاج إلى محتوى فعلي معتمد — سنة التأسيس، الرؤية، الرسالة، والقيم —
              يُرجى تحديثه عبر لوحة تحكم المحتوى قبل الإطلاق.]
            </p>
          </>
        ) : (
          <>
            <p>
              AR Qudrix is a global technology and business group bringing together a family of ventures
              under one umbrella, supported by a central AI orchestration platform.
            </p>
            <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 not-prose">
              <strong>Operator note:</strong> this section needs real, approved content — founding year,
              mission, vision, and values — before launch. Replace this placeholder via the admin content
              module. Per the project&rsquo;s architecture rules, no facts are fabricated here.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
