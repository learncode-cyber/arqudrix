import Link from "next/link";

type Locale = "en" | "ar";

const COMPANY_LINKS: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/about", label: "About" },
    { href: "/careers", label: "Careers" },
    { href: "/partners", label: "Partners" },
    { href: "/investors", label: "Investors" },
  ],
  ar: [
    { href: "/about", label: "من نحن" },
    { href: "/careers", label: "الوظائف" },
    { href: "/partners", label: "الشركاء" },
    { href: "/investors", label: "المستثمرون" },
  ],
};

const LEGAL_LINKS: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  ar: [
    { href: "/privacy", label: "سياسة الخصوصية" },
    { href: "/terms", label: "شروط الخدمة" },
  ],
};

export function Footer({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {COMPANY_LINKS[locale].map((link) => (
              <Link key={link.href} href={`/${locale}${link.href}`} className="text-sm text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS[locale].map((link) => (
              <Link key={link.href} href={`/${locale}${link.href}`} className="text-sm text-slate-500 hover:text-slate-800">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} AR Qudrix. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
