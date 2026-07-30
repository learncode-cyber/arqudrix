declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Loads the Meta Pixel base script and fires the initial PageView.
 * Must only be called after consent has been granted — see
 * components/analytics-scripts.tsx, which is the sole caller.
 *
 * `pixelId` comes from the admin-controlled IntegrationSettings row (see
 * packages/domain/src/settings), not from a build-time env var — so
 * enabling/disabling or rotating the pixel from the admin panel takes
 * effect immediately, no redeploy needed.
 */
export function initMetaPixel(pixelId: string): void {
  if (!pixelId || typeof window === "undefined" || window.fbq) return;

  // Standard Meta Pixel bootstrap snippet, loaded programmatically instead
  // of via next/script's dangerouslySetInnerHTML so it can be gated behind
  // the consent check at the call site.
  const fbq = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fbq as any).callMethod
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fbq as any).callMethod(...args)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fbq as any).queue.push(args);
  } as typeof window.fbq & { queue: unknown[]; loaded: boolean; version: string };

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function trackMetaEvent(eventName: "Lead" | "CompleteRegistration" | "Contact", params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}
