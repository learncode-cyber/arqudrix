import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { leadService, listLeadsQuerySchema } from "@arqudrix/domain";
import { LeadTable } from "./lead-table";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const query = listLeadsQuerySchema.parse({ pageSize: 100 });
  const { items, total } = await leadService.listForAdmin(
    { id: session.user.id, role: session.user.role },
    query
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">{total} inquiries captured from the public contact form.</p>
      </div>

      <LeadTable initialItems={items} />
    </div>
  );
}
