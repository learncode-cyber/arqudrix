const CONSENT_STORAGE_KEY = "arqudrix_analytics_consent";

export type ConsentStatus = "granted" | "denied" | "unset";

/**
 * Single source of truth for analytics/ads consent state.
 *
 * Meta Pixel and Google Ads are both regulated by privacy law (GDPR in the
 * EU, and similarly under UAE/other jurisdictions this site targets per the
 * architecture audit's international SEO list). Neither script is allowed
 * to load — not even in a "consent-pending, load anyway" mode — until the
 * visitor has explicitly clicked Accept on the cookie banner. This file is
 * the only place that reads/writes consent state; every tracking call goes
 * through `hasConsent()` first.
 */
export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "unset";
  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return stored === "granted" || stored === "denied" ? stored : "unset";
}

export function setConsentStatus(status: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
  window.dispatchEvent(new CustomEvent("arqudrix:consent-change", { detail: status }));
}

export function hasConsent(): boolean {
  return getConsentStatus() === "granted";
}
