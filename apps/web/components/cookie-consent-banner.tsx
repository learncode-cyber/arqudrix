"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsentStatus, setConsentStatus } from "@/lib/analytics/consent";

export function CookieConsentBanner({ locale }: { locale: "en" | "ar" }) {
  const [visible, setVisible] = useState(false);
  const isArabic = locale === "ar";

  useEffect(() => {
    // Only show the banner if the visitor hasn't made a choice yet. Runs in
    // an effect (not during render) because consent is read from
    // localStorage, which doesn't exist during server rendering.
    setVisible(getConsentStatus() === "unset");
  }, []);

  if (!visible) return null;

  function handleChoice(status: "granted" | "denied") {
    setConsentStatus(status);
    setVisible(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-6 py-4 shadow-lg"
      dir={isArabic ? "rtl" : "ltr"}
      role="dialog"
      aria-label={isArabic ? "إعدادات ملفات تعريف الارتباط" : "Cookie settings"}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-600">
          {isArabic ? (
            <>
              نستخدم ملفات تعريف ارتباط اختيارية للتحليلات والإعلانات لتحسين موقعنا. راجع{" "}
              <Link href={`/${locale}/privacy`} className="underline">
                سياسة الخصوصية
              </Link>{" "}
              لمزيد من التفاصيل.
            </>
          ) : (
            <>
              We use optional analytics and advertising cookies to improve our site. See our{" "}
              <Link href={`/${locale}/privacy`} className="underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </>
          )}
        </p>

        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => handleChoice("denied")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {isArabic ? "رفض" : "Decline"}
          </button>
          <button
            onClick={() => handleChoice("granted")}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
          >
            {isArabic ? "قبول" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
