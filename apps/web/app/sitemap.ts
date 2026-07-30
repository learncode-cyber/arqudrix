import type { MetadataRoute } from "next";
import { businessService, contentService, listBusinessesQuerySchema, listBlogPostsQuerySchema } from "@arqudrix/domain";

const LOCALES = ["en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arqudrix.com";

  const staticRoutes = [
    "",
    "/businesses",
    "/blog",
    "/contact",
    "/about",
    "/careers",
    "/partners",
    "/investors",
    "/privacy",
    "/terms",
  ];

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.7,
    }))
  );

  const businessEntries: MetadataRoute.Sitemap = [];
  const blogEntries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const businessQuery = listBusinessesQuerySchema.parse({ locale, pageSize: 100 });
    const { items: businesses } = await businessService.listPublished(businessQuery);

    for (const business of businesses) {
      if (business.status === "ARCHIVED") continue;
      businessEntries.push({
        url: `${siteUrl}/${locale}/businesses/${business.slug}`,
        lastModified: business.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    const blogQuery = listBlogPostsQuerySchema.parse({ locale, pageSize: 100 });
    const { items: posts } = await contentService.listPublished(blogQuery);

    for (const post of posts) {
      blogEntries.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticEntries, ...businessEntries, ...blogEntries];
}
