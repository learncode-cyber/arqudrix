import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

type Locale = "en" | "ar";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/portal/login`);

  const isArabic = locale === "ar";

  const navItems = [
    { href: "dashboard", label: isArabic ? "لوحة التحكم" : "Dashboard" },
    { href: "inquiries", label: isArabic ? "الاستفسارات" : "Inquiries" },
    { href: "profile", label: isArabic ? "الملف الشخصي" : "Profile" },
  ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl gap-8 px-6 py-12" dir={isArabic ? "rtl" : "ltr"}>
      <aside className="w-56 shrink-0">
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
          <p className="text-xs text-slate-500">{session.user.role}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}/portal/${item.href}`}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: `/${locale}/portal/login` });
          }}
        >
          <button type="submit" className="mt-4 px-3 text-xs font-medium text-red-600 hover:underline">
            {isArabic ? "تسجيل الخروج" : "Sign out"}
          </button>
        </form>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
