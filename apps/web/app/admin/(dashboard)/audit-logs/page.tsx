import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { auditLogService, listAuditLogsQuerySchema } from "@arqudrix/domain";
import { LogMetadata } from "./log-metadata";

export const metadata = { title: "Audit Logs" };

const ENTITY_TYPES = ["Business", "BlogPost", "User", "Lead"];

interface PageProps {
  searchParams: Promise<{ entityType?: string; action?: string; page?: string }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const params = await searchParams;
  const query = listAuditLogsQuerySchema.parse({
    entityType: params.entityType || undefined,
    action: params.action || undefined,
    page: params.page ?? "1",
    pageSize: 50,
  });

  const { items, total } = await auditLogService.list(
    { id: session.user.id, role: session.user.role },
    query
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} recorded actions. Immutable — every sensitive admin action is logged here permanently.
        </p>
      </div>

      <form className="mb-6 flex gap-3" method="GET">
        <select
          name="entityType"
          defaultValue={query.entityType ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All entity types</option>
          {ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          name="action"
          defaultValue={query.action ?? ""}
          placeholder="Filter by action, e.g. business.status_changed"
          className="w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light">
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">When</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.actor ? (
                    <>
                      <p className="font-medium text-slate-900">{log.actor.fullName}</p>
                      <p className="text-xs text-slate-400">{log.actor.role}</p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">System / deleted user</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.action}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {log.entityType}
                  {log.entityId && <span className="block text-xs text-slate-400">{log.entityId}</span>}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <LogMetadata metadata={log.metadata} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                  No audit log entries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
