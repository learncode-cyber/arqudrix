"use client";

import { useEffect } from "react";
import { hasConsent } from "@/lib/analytics/consent";
import { initMetaPixel } from "@/lib/analytics/meta-pixel";
import { initGoogleAds } from "@/lib/analytics/google-ads";
import { setAnalyticsSettings, type AnalyticsSettings } from "@/lib/analytics/state";

/**
 * Receives the admin-controlled integration settings from the server
 * component tree (fetched via settingsService.getPublicSettings() in the
 * locale layout) and, once the visitor has granted cookie consent,
 * initializes whichever pixels are enabled.
 */
export function AnalyticsScripts({ settings }: { settings: AnalyticsSettings }) {
  useEffect(() => {
    setAnalyticsSettings(settings);

    function loadIfConsented() {
      if (!hasConsent()) return;
      if (settings.metaPixelId) initMetaPixel(settings.metaPixelId);
      if (settings.googleAdsId) initGoogleAds(settings.googleAdsId);
    }

    loadIfConsented();

    // The cookie banner dispatches this event the moment the visitor clicks
    // Accept, so tracking can start immediately without a page reload.
    window.addEventListener("arqudrix:consent-change", loadIfConsented);
    return () => window.removeEventListener("arqudrix:consent-change", loadIfConsented);
  }, [settings]);

  return null;
}
