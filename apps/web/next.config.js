/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@arqudrix/ui", "@arqudrix/domain", "@arqudrix/db", "@arqudrix/auth"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.arqudrix.com" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' https: data:",
              "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net",
              "connect-src 'self' https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://analytics.google.com https://googleads.g.doubleclick.net https://www.googletagmanager.com",
              "frame-src https://www.googletagmanager.com https://td.doubleclick.net",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
        ],
      },
      {
        // The admin panel is a single Node.js app deployment sharing this
        // same Next.js project (see README "Single-app deployment") — it
        // must never be indexed and should not be frame-embeddable, even
        // though it doesn't live on its own subdomain.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

module.exports = nextConfig;
