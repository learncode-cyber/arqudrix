import Link from "next/link";

type Locale = "en" | "ar";

const NAV_LINKS: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/businesses", label: "Businesses" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  ar: [
    { href: "/businesses", label: "أعمالنا" },
    { href: "/blog", label: "المدونة" },
    { href: "/contact", label: "تواصل معنا" },
  ],
};

export function Navbar({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const otherLocale: Locale = isArabic ? "en" : "ar";

  return (
    <header className="border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight text-slate-900">
          AR Qudrix
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS[locale].map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={`/${locale}/portal/login`}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {isArabic ? "بوابة العملاء" : "Client Portal"}
          </Link>

          <Link
            href={`/${otherLocale}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {isArabic ? "English" : "العربية"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
