export interface AnalyticsSettings {
  metaPixelId: string | null;
  googleAdsId: string | null;
  googleAdsLeadConversionLabel: string | null;
  googleAdsRegistrationConversionLabel: string | null;
}

let currentSettings: AnalyticsSettings = {
  metaPixelId: null,
  googleAdsId: null,
  googleAdsLeadConversionLabel: null,
  googleAdsRegistrationConversionLabel: null,
};

/**
 * Called once by <AnalyticsScripts> with the settings fetched server-side
 * from IntegrationSettings (admin-controlled, see packages/domain/src/settings).
 * Every other module in lib/analytics reads from `getAnalyticsSettings()`
 * instead of process.env, so toggling a pixel on/off in the admin panel
 * takes effect without a rebuild or redeploy.
 */
export function setAnalyticsSettings(settings: AnalyticsSettings): void {
  currentSettings = settings;
}

export function getAnalyticsSettings(): AnalyticsSettings {
  return currentSettings;
}
