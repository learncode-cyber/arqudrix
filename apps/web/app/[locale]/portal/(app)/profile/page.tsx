import { prisma } from "@arqudrix/db";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

type Locale = "en" | "ar";

export const metadata = { title: "Profile" };

export default async function PortalProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await auth();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { fullName: true, email: true, role: true, locale: true, createdAt: true, lastLoginAt: true },
  });

  const fields = [
    { label: isArabic ? "الاسم الكامل" : "Full Name", value: user.fullName },
    { label: isArabic ? "البريد الإلكتروني" : "Email", value: user.email },
    { label: isArabic ? "الدور" : "Role", value: user.role.replace("_", " ") },
    {
      label: isArabic ? "عضو منذ" : "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(isArabic ? "ar" : "en-US"),
    },
    {
      label: isArabic ? "آخر تسجيل دخول" : "Last Login",
      value: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleString(isArabic ? "ar" : "en-US")
        : isArabic
          ? "أول تسجيل دخول"
          : "This is your first login",
    },
  ];

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold text-slate-900">{isArabic ? "الملف الشخصي" : "Profile"}</h1>

      <dl className="mt-8 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {fields.map((field) => (
          <div key={field.label} className="grid grid-cols-3 gap-4 px-5 py-4">
            <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
            <dd className="col-span-2 text-sm text-slate-900">{field.value}</dd>
          </div>
        ))}
      </dl>

      <ChangePasswordForm locale={locale} />
    </div>
  );
}
