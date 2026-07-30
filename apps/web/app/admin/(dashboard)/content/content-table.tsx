"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BlogPost, ContentStatus } from "@arqudrix/db";

type PostRow = BlogPost & { translations: { locale: string; title: string; excerpt: string }[] };

const STATUS_OPTIONS: ContentStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "UNPUBLISHED"];

const STATUS_STYLES: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  UNPUBLISHED: "bg-red-100 text-red-700",
};

export function ContentTable({ initialItems }: { initialItems: PostRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleStatusChange(id: string, status: ContentStatus) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}" permanently?`)) return;

    const response = await fetch(`/api/v1/content/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to delete");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`"${title}" deleted`);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Slug</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((post) => {
            const enTranslation = post.translations.find((t) => t.locale === "en");
            return (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{enTranslation?.title ?? "(untranslated)"}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">{enTranslation?.excerpt}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{post.slug}</td>
                <td className="px-4 py-3">
                  <select
                    value={post.status}
                    onChange={(e) => handleStatusChange(post.id, e.target.value as ContentStatus)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLES[post.status]}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/content/${post.id}/edit`} className="mr-3 font-medium text-brand hover:underline">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, enTranslation?.title ?? post.slug)}
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
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                No posts yet — click &ldquo;New Post&rdquo; to write the first one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
