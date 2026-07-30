import { hasConsent } from "./consent";
import { trackMetaEvent } from "./meta-pixel";
import { trackGoogleAdsConversion } from "./google-ads";
import { getAnalyticsSettings } from "./state";

/**
 * Call this after a successful lead/contact-form submission.
 * Fires both the Meta Pixel "Lead" event and the Google Ads lead conversion.
 * No-ops silently if the visitor has not granted consent, or if a given
 * platform isn't enabled in Admin → Integrations — callers never need to
 * check either condition themselves.
 */
export function trackLeadConversion(): void {
  if (!hasConsent()) return;

  const settings = getAnalyticsSettings();
  if (settings.metaPixelId) trackMetaEvent("Lead");
  if (settings.googleAdsId) {
    trackGoogleAdsConversion(settings.googleAdsId, settings.googleAdsLeadConversionLabel);
  }
}

/** Call this after a successful portal account registration. */
export function trackRegistrationConversion(): void {
  if (!hasConsent()) return;

  const settings = getAnalyticsSettings();
  if (settings.metaPixelId) trackMetaEvent("CompleteRegistration");
  if (settings.googleAdsId) {
    trackGoogleAdsConversion(settings.googleAdsId, settings.googleAdsRegistrationConversionLabel);
  }
}
