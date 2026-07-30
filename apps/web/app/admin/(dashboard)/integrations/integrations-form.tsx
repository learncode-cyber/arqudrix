"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateIntegrationSettingsSchema, type UpdateIntegrationSettingsInput } from "@arqudrix/domain";
import type { IntegrationSettings } from "@arqudrix/db";

export function IntegrationsForm({
  initialValues,
  canEdit,
}: {
  initialValues: IntegrationSettings;
  canEdit: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateIntegrationSettingsInput>({
    resolver: zodResolver(updateIntegrationSettingsSchema),
    defaultValues: {
      metaPixelEnabled: initialValues.metaPixelEnabled,
      metaPixelId: initialValues.metaPixelId,
      googleAdsEnabled: initialValues.googleAdsEnabled,
      googleAdsId: initialValues.googleAdsId,
      googleAdsLeadConversionLabel: initialValues.googleAdsLeadConversionLabel,
      googleAdsRegistrationConversionLabel: initialValues.googleAdsRegistrationConversionLabel,
    },
  });

  const metaPixelEnabled = watch("metaPixelEnabled");
  const googleAdsEnabled = watch("googleAdsEnabled");

  async function onSubmit(data: UpdateIntegrationSettingsInput) {
    const response = await fetch("/api/v1/settings/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to save settings");
      return;
    }

    toast.success("Integration settings updated — live on the site now");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
      <fieldset disabled={!canEdit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Meta Pixel</h2>
            <p className="mt-1 text-xs text-slate-400">Fires PageView, Lead, and CompleteRegistration events.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("metaPixelEnabled")} className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Pixel ID</label>
          <input
            {...register("metaPixelId")}
            disabled={!metaPixelEnabled}
            placeholder="1234567890123456"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          {errors.metaPixelId && <p className="mt-1 text-xs text-red-600">{errors.metaPixelId.message}</p>}
        </div>
      </fieldset>

      <fieldset disabled={!canEdit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Google Ads</h2>
            <p className="mt-1 text-xs text-slate-400">Fires conversion events for leads and registrations.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("googleAdsEnabled")} className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Google Ads Tag ID</label>
          <input
            {...register("googleAdsId")}
            disabled={!googleAdsEnabled}
            placeholder="AW-1234567890"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          {errors.googleAdsId && <p className="mt-1 text-xs text-red-600">{errors.googleAdsId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Lead Conversion Label</label>
            <input
              {...register("googleAdsLeadConversionLabel")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Registration Conversion Label</label>
            <input
              {...register("googleAdsRegistrationConversionLabel")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
      </fieldset>

      {canEdit && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      )}
    </form>
  );
}
