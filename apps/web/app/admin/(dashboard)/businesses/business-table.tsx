"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Business, BusinessStatus } from "@arqudrix/db";

type BusinessRow = Business & {
  translations: { locale: string; name: string; tagline: string }[];
};

const STATUS_OPTIONS: BusinessStatus[] = ["ACTIVE", "IN_DEVELOPMENT", "PLANNED", "ARCHIVED"];

const STATUS_STYLES: Record<BusinessStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  IN_DEVELOPMENT: "bg-amber-100 text-amber-800",
  PLANNED: "bg-slate-100 text-slate-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

export function BusinessTable({ initialItems }: { initialItems: BusinessRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleStatusChange(id: string, toStatus: BusinessStatus) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/businesses/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? "Failed to update status");
        return;
      }

      const updated = await response.json();
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item)));
      toast.success("Status updated");
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;

    const response = await fetch(`/api/v1/businesses/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to delete");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`"${name}" deleted`);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Slug</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((business) => {
            const enTranslation = business.translations.find((t) => t.locale === "en");
            return (
              <tr key={business.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{enTranslation?.name ?? "(untranslated)"}</p>
                  <p className="text-xs text-slate-500">{enTranslation?.tagline}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{business.slug}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{business.category}</td>
                <td className="px-4 py-3">
                  <select
                    value={business.status}
                    disabled={isPending}
                    onChange={(e) => handleStatusChange(business.id, e.target.value as BusinessStatus)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLES[business.status]}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{business.displayOrder}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/businesses/${business.id}/edit`} className="mr-3 font-medium text-brand hover:underline">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(business.id, enTranslation?.name ?? business.slug)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                No businesses yet — click &ldquo;Add Business&rdquo; to create the first card.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
