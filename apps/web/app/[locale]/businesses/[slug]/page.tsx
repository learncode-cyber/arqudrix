import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { businessService, BusinessNotFoundError } from "@arqudrix/domain";
import { StatusBadge } from "@/components/status-badge";

type Locale = "en" | "ar";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function loadBusiness(slug: string, locale: Locale) {
  try {
    return await businessService.getBySlugPublic(slug, locale);
  } catch (error) {
    if (error instanceof BusinessNotFoundError) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const business = await loadBusiness(slug, locale);

  if (!business) return { title: "Not Found" };

  const translation = business.translations[0];

  return {
    title: translation?.metaTitle || translation?.name,
    description: translation?.metaDescription || translation?.tagline,
    alternates: {
      languages: { en: `/en/businesses/${slug}`, ar: `/ar/businesses/${slug}` },
    },
    openGraph: {
      title: translation?.name,
      description: translation?.tagline,
      images: business.coverImageUrl ? [business.coverImageUrl] : undefined,
    },
  };
}

export default async function BusinessLandingPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const business = await loadBusiness(slug, locale);

  if (!business || business.status === "ARCHIVED") {
    notFound();
  }

  const translation = business.translations[0];
  if (!translation) notFound();

  const isArabic = locale === "ar";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: translation.name,
    description: translation.tagline,
    url: business.websiteUrl ?? undefined,
    parentOrganization: { "@type": "Organization", name: "AR Qudrix" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <header className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-4">
            <StatusBadge status={business.status} locale={locale} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{translation.name}</h1>
          <p className="mt-3 text-lg text-slate-600">{translation.tagline}</p>

          {business.status === "PLANNED" && (
            <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {isArabic
                ? "هذا المشروع مخطط له ولم يتم إطلاقه بعد."
                : "This business is planned and has not launched yet."}
            </p>
          )}

          {business.websiteUrl && (
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-light"
            >
              {isArabic ? "زيارة الموقع" : "Visit Website"}
            </a>
          )}
        </div>
      </header>

      {business.coverImageUrl && (
        <div className="relative mx-auto h-72 max-w-5xl px-6 pt-10">
          <Image
            src={business.coverImageUrl}
            alt={translation.name}
            fill
            className="rounded-xl object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-slate max-w-none" dir={isArabic ? "rtl" : "ltr"}>
          {translation.description.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
