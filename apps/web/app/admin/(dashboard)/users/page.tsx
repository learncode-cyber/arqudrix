import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { userManagementService, listUsersQuerySchema } from "@arqudrix/domain";
import { UserTable } from "./user-table";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const query = listUsersQuerySchema.parse({ pageSize: 100 });
  const { items, total } = await userManagementService.list(
    { id: session.user.id, role: session.user.role },
    query
  );

  const canEdit = session.user.role === "SUPER_ADMIN";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} total. {canEdit ? "You can change roles and suspend accounts." : "Read-only — only SUPER_ADMIN can edit roles or suspend accounts."}
        </p>
      </div>

      <UserTable initialItems={items} canEdit={canEdit} currentUserId={session.user.id} />
    </div>
  );
}
