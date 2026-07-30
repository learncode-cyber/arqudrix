import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "تواصل معنا" : "Contact Us",
    description: isArabic
      ? "تواصل مع فريق أيه آر قدريكس لأي استفسارات تجارية."
      : "Get in touch with the AR Qudrix team for any business inquiry.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {isArabic ? "تواصل معنا" : "Contact Us"}
      </h1>
      <p className="mt-3 text-slate-600">
        {isArabic
          ? "أخبرنا عن مشروعك أو استفسارك وسيتواصل معك فريقنا قريباً."
          : "Tell us about your project or inquiry and our team will get back to you shortly."}
      </p>

      <div className="mt-8">
        <ContactForm locale={locale} />
      </div>
    </main>
  );
}
