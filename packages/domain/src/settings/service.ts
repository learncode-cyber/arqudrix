import { z } from "zod";
import { prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";

const TENANT_ID = "arqudrix-core";

export const updateIntegrationSettingsSchema = z.object({
  metaPixelEnabled: z.boolean(),
  metaPixelId: z
    .string()
    .regex(/^\d+$/, "Meta Pixel ID should be numeric, e.g. 1234567890123456")
    .optional()
    .nullable(),
  googleAdsEnabled: z.boolean(),
  googleAdsId: z
    .string()
    .regex(/^AW-\d+$/, "Google Ads ID should look like AW-1234567890")
    .optional()
    .nullable(),
  googleAdsLeadConversionLabel: z.string().max(100).optional().nullable(),
  googleAdsRegistrationConversionLabel: z.string().max(100).optional().nullable(),
});

export type UpdateIntegrationSettingsInput = z.infer<typeof updateIntegrationSettingsSchema>;

export interface PublicIntegrationSettings {
  metaPixelId: string | null;
  googleAdsId: string | null;
  googleAdsLeadConversionLabel: string | null;
  googleAdsRegistrationConversionLabel: string | null;
}

interface ActingUser {
  id: string;
  role: UserRole;
}

/**
 * IntegrationSettings is a singleton row (one per tenant). `getOrCreate`
 * lazily creates the row with all-disabled defaults the first time it's
 * read, so there's no separate seed/migration step required before the
 * admin Integrations page works.
 */
export class SettingsService {
  private async getOrCreate() {
    const existing = await prisma.integrationSettings.findUnique({ where: { tenantId: TENANT_ID } });
    if (existing) return existing;
    return prisma.integrationSettings.create({ data: { tenantId: TENANT_ID } });
  }

  /**
   * Public read, used server-side by apps/web to decide which pixel/tag
   * scripts to render. Pixel/Tag IDs are not secrets — they are always
   * visible in any browser's network tab once loaded — so no RBAC check
   * is needed here. Only the write path is restricted.
   */
  async getPublicSettings(): Promise<PublicIntegrationSettings> {
    const settings = await this.getOrCreate();
    return {
      metaPixelId: settings.metaPixelEnabled ? settings.metaPixelId : null,
      googleAdsId: settings.googleAdsEnabled ? settings.googleAdsId : null,
      googleAdsLeadConversionLabel: settings.googleAdsEnabled ? settings.googleAdsLeadConversionLabel : null,
      googleAdsRegistrationConversionLabel: settings.googleAdsEnabled
        ? settings.googleAdsRegistrationConversionLabel
        : null,
    };
  }

  async getForAdmin(actor: ActingUser) {
    assertPermission(actor.role, "integration:read");
    return this.getOrCreate();
  }

  async update(actor: ActingUser, input: UpdateIntegrationSettingsInput) {
    assertPermission(actor.role, "integration:manage_credentials");

    await this.getOrCreate(); // ensure the row exists before upserting

    const updated = await prisma.integrationSettings.update({
      where: { tenantId: TENANT_ID },
      data: { ...input, updatedById: actor.id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "integration_settings.updated",
        entityType: "IntegrationSettings",
        entityId: updated.id,
        metadata: {
          metaPixelEnabled: input.metaPixelEnabled,
          googleAdsEnabled: input.googleAdsEnabled,
        },
      },
    });

    return updated;
  }
}

export const settingsService = new SettingsService();
