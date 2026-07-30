import type { Metadata } from "next";
import { Toaster } from "sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "AR Qudrix Admin",
    template: "%s · AR Qudrix Admin",
  },
  // Never indexed — this is an internal tool, not part of the public site.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
