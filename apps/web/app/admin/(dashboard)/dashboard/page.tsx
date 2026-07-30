import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { businessService, listBusinessesQuerySchema } from "@arqudrix/domain";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const query = listBusinessesQuerySchema.parse({ locale: "en", pageSize: 100 });
  const { items, total } = await businessService.listForAdmin(
    { id: session.user.id, role: session.user.role },
    query
  );

  const activeCount = items.filter((b) => b.status === "ACTIVE").length;
  const inDevCount = items.filter((b) => b.status === "IN_DEVELOPMENT").length;
  const plannedCount = items.filter((b) => b.status === "PLANNED").length;

  const cards = [
    { label: "Total Businesses", value: total },
    { label: "Active", value: activeCount },
    { label: "In Development", value: inDevCount },
    { label: "Planned", value: plannedCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {session.user.name}</h1>
      <p className="mt-1 text-sm text-slate-500">Here&rsquo;s the current state of your ecosystem.</p>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold text-brand">{card.value}</p>
          </div>
        ))}
      </div>

      <Link
        href="/admin/businesses"
        className="mt-8 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
      >
        Manage Businesses →
      </Link>
    </div>
  );
}
