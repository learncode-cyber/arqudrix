"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBlogPostSchema, type CreateBlogPostInput } from "@arqudrix/domain";
import { ContentStatus } from "@arqudrix/db";

interface ContentFormProps {
  mode: "create" | "edit";
  postId?: string;
  defaultValues?: Partial<CreateBlogPostInput>;
}

const EMPTY_TRANSLATION = { locale: "en" as const, title: "", excerpt: "", body: "" };

export function ContentForm({ mode, postId, defaultValues }: ContentFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBlogPostInput>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: defaultValues ?? {
      slug: "",
      status: ContentStatus.DRAFT,
      translations: [EMPTY_TRANSLATION, { ...EMPTY_TRANSLATION, locale: "ar" }],
    },
  });

  const { fields } = useFieldArray({ control, name: "translations" });

  async function onSubmit(data: CreateBlogPostInput) {
    const url = mode === "create" ? "/api/v1/content" : `/api/v1/content/${postId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to save post");
      return;
    }

    toast.success(mode === "create" ? "Post created" : "Post updated");
    router.push("/admin/content");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Core Details</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700">Slug (URL identifier)</label>
          <input
            {...register("slug")}
            placeholder="how-arq-os-orchestrates-ai-agents"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Public URL will be /blog/{"{slug}"}</p>
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select {...register("status")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {Object.values(ContentStatus).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Cover Image URL</label>
            <input {...register("coverImageUrl")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {fields.map((field, index) => (
        <section key={field.id} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Content — {field.locale === "en" ? "English" : "Arabic (العربية)"}
          </h2>

          <input type="hidden" {...register(`translations.${index}.locale`)} value={field.locale} />

          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              {...register(`translations.${index}.title`)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              dir={field.locale === "ar" ? "rtl" : "ltr"}
            />
            {errors.translations?.[index]?.title && (
              <p className="mt-1 text-xs text-red-600">{errors.translations[index]?.title?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Excerpt (shown in listings)</label>
            <textarea
              {...register(`translations.${index}.excerpt`)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              dir={field.locale === "ar" ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Body (Markdown supported)</label>
            <textarea
              {...register(`translations.${index}.body`)}
              rows={12}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              dir={field.locale === "ar" ? "rtl" : "ltr"}
            />
          </div>
        </section>
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
