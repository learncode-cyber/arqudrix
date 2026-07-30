import type { Metadata } from "next";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy" };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {isArabic ? "آخر تحديث: [التاريخ]" : "Last updated: [DATE — set before publishing]"}
      </p>

      <div className="prose prose-slate mt-8 max-w-none" dir={isArabic ? "rtl" : "ltr"}>
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 not-prose">
          {isArabic
            ? "ملاحظة للمشغّل: هذا قالب قياسي لسياسة الخصوصية. يجب مراجعته من قِبل مستشار قانوني وتحديث الحقول بين قوسين قبل النشر."
            : "Operator note: this is a standard privacy policy template. It must be reviewed by qualified legal counsel and every bracketed field filled in with your real company details before publishing."}
        </p>

        {isArabic ? (
          <>
            <h2>من نحن</h2>
            <p>
              أيه آر قدريكس (&ldquo;نحن&rdquo;)، ومقرها المسجل [العنوان المسجل للشركة]، مسؤولة عن بياناتك
              الشخصية التي نجمعها عبر هذا الموقع.
            </p>

            <h2>البيانات التي نجمعها</h2>
            <ul>
              <li>بيانات نموذج التواصل: الاسم، البريد الإلكتروني، الهاتف (اختياري)، اسم الشركة (اختياري)، والرسالة.</li>
              <li>بيانات حساب البوابة (عند التسجيل): الاسم، البريد الإلكتروني، وكلمة مرور مشفّرة.</li>
              <li>بيانات تحليلية وإعلانية غير شخصية عبر بكسل ميتا وإعلانات جوجل، بعد الحصول على موافقتك عبر شريط الكوكيز.</li>
              <li>عنوان IP، ويُحفظ بصيغة مجزّأة (hash) فقط لأغراض الحماية من إساءة الاستخدام.</li>
            </ul>

            <h2>كيف نستخدم بياناتك</h2>
            <p>للرد على استفساراتك، لتشغيل حسابك في البوابة، ولتحسين الموقع. لا نبيع بياناتك لأطراف ثالثة.</p>

            <h2>حقوقك</h2>
            <p>
              يحق لك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها. للتواصل بخصوص الخصوصية: [بريد إلكتروني مخصص
              للخصوصية].
            </p>

            <h2>ملفات تعريف الارتباط (الكوكيز)</h2>
            <p>
              نستخدم كوكيز أساسية للموقع دائماً. بعد موافقتك الصريحة عبر شريط الكوكيز، نُفعّل أيضاً بكسل
              ميتا (Meta Pixel) وإعلانات جوجل (Google Ads) لقياس فعالية حملاتنا الإعلانية. لا يتم تحميل أي
              من هاتين الأداتين قبل موافقتك، ويمكنك سحب موافقتك في أي وقت من خلال إعدادات المتصفح.
            </p>
          </>
        ) : (
          <>
            <h2>Who we are</h2>
            <p>
              AR Qudrix (&ldquo;we&rdquo;), registered at [registered company address], is responsible for
              the personal data we collect through this website.
            </p>

            <h2>Data we collect</h2>
            <ul>
              <li>Contact form data: name, email, phone (optional), company (optional), and your message.</li>
              <li>Portal account data (if you register): name, email, and a securely hashed password.</li>
              <li>Non-identifying analytics and advertising data via Meta Pixel and Google Ads, only after you consent via the cookie banner.</li>
              <li>Your IP address, stored only as a one-way hash for abuse-prevention purposes.</li>
            </ul>

            <h2>How we use your data</h2>
            <p>To respond to your inquiries, operate your portal account, and improve the website. We do not sell your data to third parties.</p>

            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your data. Contact us at [privacy
              contact email] for any privacy-related request.
            </p>

            <h2>Cookies</h2>
            <p>
              We always use essential site cookies. After you explicitly accept via the cookie banner, we
              also enable Meta Pixel and Google Ads to measure the effectiveness of our advertising
              campaigns. Neither tool loads before you consent, and you can withdraw consent at any time
              through your browser settings.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
