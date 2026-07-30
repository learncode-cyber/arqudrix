declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads gtag.js and configures the Google Ads tag. Must only be called
 * after consent has been granted — see components/analytics-scripts.tsx.
 *
 * `tagId` comes from the admin-controlled IntegrationSettings row, not a
 * build-time env var — see lib/analytics/state.ts.
 */
export function initGoogleAds(tagId: string): void {
  if (!tagId || typeof window === "undefined" || window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  // Default to denied for ad personalization signals until the visitor
  // explicitly opts in — Google's Consent Mode v2 requirement for serving
  // ads to EU/UK/CH traffic. Since this function only runs after our own
  // cookie-consent gate has already granted consent, we immediately update
  // both signals to granted here.
  window.gtag("consent", "default", { ad_storage: "granted", analytics_storage: "granted" });
  window.gtag("config", tagId);
}

export function trackGoogleAdsConversion(tagId: string, conversionLabel: string | null): void {
  if (typeof window === "undefined" || !window.gtag || !tagId) return;

  if (!conversionLabel) {
    console.warn(
      "[google-ads] No conversion label configured for this event — set it in Admin → Integrations → Google Ads."
    );
    return;
  }

  window.gtag("event", "conversion", { send_to: `${tagId}/${conversionLabel}` });
}
