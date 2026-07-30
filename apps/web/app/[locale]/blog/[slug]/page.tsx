import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentService, ContentNotFoundError } from "@arqudrix/domain";

type Locale = "en" | "ar";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function loadPost(slug: string, locale: Locale) {
  try {
    return await contentService.getBySlugPublic(slug, locale);
  } catch (error) {
    if (error instanceof ContentNotFoundError) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await loadPost(slug, locale);
  if (!post) return { title: "Not Found" };

  const t = post.translations[0];
  return {
    title: t?.metaTitle || t?.title,
    description: t?.metaDescription || t?.excerpt,
    alternates: { languages: { en: `/en/blog/${slug}`, ar: `/ar/blog/${slug}` } },
    openGraph: {
      title: t?.title,
      description: t?.excerpt,
      type: "article",
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await loadPost(slug, locale);
  if (!post) notFound();

  const t = post.translations[0];
  if (!t) notFound();

  const isArabic = locale === "ar";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.title,
    description: t.excerpt,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: { "@type": "Organization", name: "AR Qudrix" },
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
      {post.publishedAt && (
        <time className="mt-3 block text-sm text-slate-400" dateTime={post.publishedAt.toISOString()}>
          {new Date(post.publishedAt).toLocaleDateString(isArabic ? "ar" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div className="prose prose-slate mt-8 max-w-none" dir={isArabic ? "rtl" : "ltr"}>
        {t.body.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
