import Link from "next/link";
import { auth } from "@/lib/auth";
import { businessService, listBusinessesQuerySchema } from "@arqudrix/domain";
import { redirect } from "next/navigation";
import { BusinessTable } from "./business-table";

export const metadata = { title: "Businesses / Products" };

export default async function BusinessesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const query = listBusinessesQuerySchema.parse({ locale: "en", pageSize: 100 });
  const { items, total } = await businessService.listForAdmin(
    { id: session.user.id, role: session.user.role },
    query
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Businesses / Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} total — these power the /businesses card grid and each dedicated landing page on the public site.
          </p>
        </div>
        <Link
          href="/admin/businesses/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          + Add Business
        </Link>
      </div>

      <BusinessTable initialItems={items} />
    </div>
  );
}
