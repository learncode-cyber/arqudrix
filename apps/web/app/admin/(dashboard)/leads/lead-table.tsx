"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Lead, LeadStatus, Business, BusinessTranslation } from "@arqudrix/db";

type LeadRow = Lead & { business: (Business & { translations: Pick<BusinessTranslation, "name">[] }) | null };

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED", "SPAM"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUALIFIED: "bg-violet-100 text-violet-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-slate-100 text-slate-600",
  SPAM: "bg-red-100 text-red-700",
};

export function LeadTable({ initialItems }: { initialItems: LeadRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  async function handleStatusChange(id: string, status: LeadStatus) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/leads/${id}`, {
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete the inquiry from "${name}"? This cannot be undone.`)) return;

    const response = await fetch(`/api/v1/leads/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to delete");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Message</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Business</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Received</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((lead) => (
            <tr key={lead.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{lead.fullName}</p>
                <p className="text-xs text-slate-500">{lead.email}</p>
                {lead.company && <p className="text-xs text-slate-400">{lead.company}</p>}
              </td>
              <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                <p className="line-clamp-3">{lead.message}</p>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {lead.business?.translations[0]?.name ?? <span className="text-slate-400">General</span>}
              </td>
              <td className="px-4 py-3">
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                  className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLES[lead.status]}`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button onClick={() => handleDelete(lead.id, lead.fullName)} className="font-medium text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                No leads yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
