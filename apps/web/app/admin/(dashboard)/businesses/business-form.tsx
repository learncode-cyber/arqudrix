"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBusinessSchema, type CreateBusinessInput } from "@arqudrix/domain";
import { BusinessCategory, BusinessStatus } from "@arqudrix/db";

interface BusinessFormProps {
  mode: "create" | "edit";
  businessId?: string;
  defaultValues?: Partial<CreateBusinessInput>;
}

const EMPTY_TRANSLATION = { locale: "en" as const, name: "", tagline: "", description: "" };

export function BusinessForm({ mode, businessId, defaultValues }: BusinessFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: defaultValues ?? {
      slug: "",
      category: BusinessCategory.OTHER,
      status: BusinessStatus.PLANNED,
      displayOrder: 0,
      isFeatured: false,
      translations: [EMPTY_TRANSLATION, { ...EMPTY_TRANSLATION, locale: "ar" }],
    },
  });

  const { fields } = useFieldArray({ control, name: "translations" });

  async function onSubmit(data: CreateBusinessInput) {
    const url = mode === "create" ? "/api/v1/businesses" : `/api/v1/businesses/${businessId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to save business");
      return;
    }

    toast.success(mode === "create" ? "Business created" : "Business updated");
    router.push("/admin/businesses");
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
            placeholder="ar-prime-market"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Public URL will be /businesses/{"{slug}"}</p>
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select {...register("category")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {Object.values(BusinessCategory).map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select {...register("status")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {Object.values(BusinessStatus).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Logo URL</label>
            <input {...register("logoUrl")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Cover Image URL</label>
            <input {...register("coverImageUrl")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Display Order</label>
            <input
              type="number"
              {...register("displayOrder", { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" {...register("isFeatured")} id="isFeatured" className="h-4 w-4 rounded border-slate-300" />
            <label htmlFor="isFeatured" className="text-sm text-slate-700">Featured on homepage</label>
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
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              {...register(`translations.${index}.name`)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              dir={field.locale === "ar" ? "rtl" : "ltr"}
            />
            {errors.translations?.[index]?.name && (
              <p className="mt-1 text-xs text-red-600">{errors.translations[index]?.name?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Tagline (shown on card)</label>
            <input
              {...register(`translations.${index}.tagline`)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              dir={field.locale === "ar" ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Full Description (landing page body)</label>
            <textarea
              {...register(`translations.${index}.description`)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          {isSubmitting ? "Saving…" : mode === "create" ? "Create Business" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
