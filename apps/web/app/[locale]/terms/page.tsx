import type { Metadata } from "next";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "شروط الخدمة" : "Terms of Service" };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "شروط الخدمة" : "Terms of Service"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {isArabic ? "آخر تحديث: [التاريخ]" : "Last updated: [DATE — set before publishing]"}
      </p>

      <div className="prose prose-slate mt-8 max-w-none" dir={isArabic ? "rtl" : "ltr"}>
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 not-prose">
          {isArabic
            ? "ملاحظة للمشغّل: هذا قالب قياسي لشروط الخدمة. يجب مراجعته من قِبل مستشار قانوني قبل النشر، خصوصاً بند القانون الحاكم."
            : "Operator note: this is a standard terms-of-service template. It must be reviewed by qualified legal counsel before publishing, especially the governing-law clause."}
        </p>

        {isArabic ? (
          <>
            <h2>قبول الشروط</h2>
            <p>باستخدامك هذا الموقع أو التسجيل في بوابة العملاء، فإنك توافق على هذه الشروط.</p>

            <h2>استخدام الموقع</h2>
            <p>يُمنع استخدام الموقع لأي غرض غير قانوني أو لمحاولة الوصول غير المصرح به إلى أنظمتنا.</p>

            <h2>حسابات البوابة</h2>
            <p>أنت مسؤول عن الحفاظ على سرية بيانات دخولك وعن جميع الأنشطة التي تتم عبر حسابك.</p>

            <h2>الملكية الفكرية</h2>
            <p>جميع المحتويات على هذا الموقع، بما في ذلك الشعارات والنصوص والتصاميم، هي ملك لأيه آر قدريكس أو مرخصة لها.</p>

            <h2>القانون الحاكم</h2>
            <p>تخضع هذه الشروط لقوانين [الاختصاص القضائي — يُحدد لاحقاً].</p>

            <h2>التواصل</h2>
            <p>لأي استفسار بخصوص هذه الشروط: [بريد إلكتروني للتواصل القانوني].</p>
          </>
        ) : (
          <>
            <h2>Acceptance of terms</h2>
            <p>By using this website or registering for the client portal, you agree to these terms.</p>

            <h2>Use of the site</h2>
            <p>You may not use this site for any unlawful purpose or attempt unauthorized access to our systems.</p>

            <h2>Portal accounts</h2>
            <p>You are responsible for keeping your login credentials confidential and for all activity under your account.</p>

            <h2>Intellectual property</h2>
            <p>All content on this site, including logos, text, and design, is owned by or licensed to AR Qudrix.</p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of [governing jurisdiction — to be finalized].</p>

            <h2>Contact</h2>
            <p>For any question about these terms: [legal contact email].</p>
          </>
        )}
      </div>
    </main>
  );
}
