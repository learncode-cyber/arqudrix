import Link from "next/link";
import { auth } from "@/lib/auth";
import { inquiryService, listInquiriesQuerySchema } from "@arqudrix/domain";

type Locale = "en" | "ar";

export const metadata = { title: "Dashboard" };

export default async function PortalDashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await auth();

  const query = listInquiriesQuerySchema.parse({ pageSize: 5 });
  const { items, total } = await inquiryService.listOwn(
    { id: session!.user.id, role: session!.user.role },
    query
  );

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold text-slate-900">
        {isArabic ? `مرحباً، ${session!.user.name}` : `Welcome back, ${session!.user.name}`}
      </h1>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">{isArabic ? "إجمالي الاستفسارات" : "Total Inquiries"}</p>
        <p className="mt-1 text-3xl font-semibold text-brand">{total}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {isArabic ? "أحدث الاستفسارات" : "Recent Inquiries"}
        </h2>
        <div className="mt-3 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">
              {isArabic ? "لا توجد استفسارات بعد." : "No inquiries yet."}
            </p>
          ) : (
            items.map((inquiry) => (
              <div key={inquiry.id} className="rounded-md border border-slate-100 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{inquiry.subject}</p>
                <p className="text-xs text-slate-500">{inquiry.status}</p>
              </div>
            ))
          )}
        </div>

        <Link
          href={`/${locale}/portal/inquiries`}
          className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
        >
          {isArabic ? "عرض جميع الاستفسارات ←" : "View all inquiries →"}
        </Link>
      </div>
    </div>
  );
}
