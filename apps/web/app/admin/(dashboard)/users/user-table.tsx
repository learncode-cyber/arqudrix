"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { UserRole, UserStatus } from "@arqudrix/db";

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  locale: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

const ROLE_OPTIONS: UserRole[] = [
  "PUBLIC_USER",
  "CUSTOMER",
  "CLIENT",
  "PARTNER",
  "SUPPLIER",
  "INVESTOR",
  "EMPLOYEE",
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

const STATUS_OPTIONS: UserStatus[] = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "DEACTIVATED"];

const STATUS_STYLES: Record<UserStatus, string> = {
  PENDING_VERIFICATION: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  SUSPENDED: "bg-amber-100 text-amber-800",
  DEACTIVATED: "bg-red-100 text-red-700",
};

export function UserTable({
  initialItems,
  canEdit,
  currentUserId,
}: {
  initialItems: UserRow[];
  canEdit: boolean;
  currentUserId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  async function handleRoleChange(id: string, role: UserRole) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? "Failed to update role");
        return;
      }

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, role } : item)));
      toast.success("Role updated");
    });
  }

  async function handleStatusChange(id: string, status: UserStatus) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? "Failed to update status");
        return;
      }

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      toast.success("Status updated");
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Last Login</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((user) => {
            const isSelf = user.id === currentUserId;
            const editable = canEdit && !isSelf;

            return (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.fullName} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={!editable}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.status}
                    disabled={!editable}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold disabled:opacity-60 ${STATUS_STYLES[user.status]}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
