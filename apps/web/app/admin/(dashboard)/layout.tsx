import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { ADMIN_SURFACE_ROLES } from "@arqudrix/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/businesses", label: "Businesses / Products" },
  { href: "/admin/content", label: "Content / Blog" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  // Defense in depth: the admin panel and the public/portal site now share
  // a single NextAuth instance (merged into one Node.js app to fit a
  // single Hostinger app slot — see README "Single-app deployment"). Any
  // authenticated user, including a CUSTOMER from the public portal, could
  // in principle reach this layout. Every mutation is already blocked at
  // the domain-service layer via assertPermission(), but that surfaces as
  // an ugly 500/thrown error rather than a clean redirect — so we also
  // gate here, at the page level, for a proper user experience.
  if (!ADMIN_SURFACE_ROLES.includes(session.user.role)) {
    redirect("/admin/login?error=insufficient_role");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-lg font-semibold tracking-tight text-brand">AR Qudrix</p>
          <p className="text-xs text-slate-500">Admin Control Panel</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-slate-200 pt-4 px-2">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-slate-500">{session.user.role}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="mt-3 text-xs font-medium text-red-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
