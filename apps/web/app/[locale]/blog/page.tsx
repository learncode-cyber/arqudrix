import type { Metadata } from "next";
import Link from "next/link";
import { contentService, listBlogPostsQuerySchema } from "@arqudrix/domain";

type Locale = "en" | "ar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "المدونة" : "Blog",
    description: isArabic
      ? "آخر الأخبار والرؤى من أيه آر قدريكس."
      : "Latest news and insights from AR Qudrix.",
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const query = listBlogPostsQuerySchema.parse({ locale, pageSize: 30 });
  const { items } = await contentService.listPublished(query);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{isArabic ? "المدونة" : "Blog"}</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-slate-500">
          {isArabic ? "لا توجد مقالات منشورة بعد." : "No posts have been published yet."}
        </p>
      ) : (
        <div className="mt-10 space-y-8">
          {items.map((post) => {
            const t = post.translations[0];
            if (!t) return null;
            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="block border-b border-slate-100 pb-8 last:border-0"
              >
                <h2 className="text-xl font-semibold text-slate-900 hover:text-brand">{t.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{t.excerpt}</p>
                {post.publishedAt && (
                  <time className="mt-2 block text-xs text-slate-400" dateTime={post.publishedAt.toISOString()}>
                    {new Date(post.publishedAt).toLocaleDateString(isArabic ? "ar" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
