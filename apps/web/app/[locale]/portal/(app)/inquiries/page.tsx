import { auth } from "@/lib/auth";
import { inquiryService, listInquiriesQuerySchema } from "@arqudrix/domain";
import { NewInquiryForm } from "./new-inquiry-form";

type Locale = "en" | "ar";

export const metadata = { title: "Inquiries" };

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default async function PortalInquiriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await auth();

  const query = listInquiriesQuerySchema.parse({ pageSize: 50 });
  const { items } = await inquiryService.listOwn(
    { id: session!.user.id, role: session!.user.role },
    query
  );

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold text-slate-900">{isArabic ? "الاستفسارات" : "Inquiries"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isArabic
          ? "تواصل مع فريق أيه آر قدريكس بخصوص مشاريعك أو الدعم الفني."
          : "Reach out to the AR Qudrix team about your projects or support needs."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">{isArabic ? "لا توجد استفسارات بعد." : "No inquiries yet."}</p>
          ) : (
            items.map((inquiry) => (
              <div key={inquiry.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{inquiry.subject}</p>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[inquiry.status]}`}>
                    {inquiry.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{inquiry.type}</p>
                <p className="mt-2 text-sm text-slate-600">{inquiry.body}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        <NewInquiryForm locale={locale} />
      </div>
    </div>
  );
}
