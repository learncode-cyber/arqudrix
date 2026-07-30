import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { businessService, BusinessNotFoundError } from "@arqudrix/domain";
import { BusinessForm } from "../../business-form";

export const metadata = { title: "Edit Business" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBusinessPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;

  try {
    const business = await businessService.getByIdForAdmin(
      { id: session.user.id, role: session.user.role },
      id
    );

    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Edit — {business.translations.find((t) => t.locale === "en")?.name ?? business.slug}
        </h1>
        <BusinessForm
          mode="edit"
          businessId={business.id}
          defaultValues={{
            slug: business.slug,
            category: business.category,
            status: business.status,
            logoUrl: business.logoUrl,
            coverImageUrl: business.coverImageUrl,
            websiteUrl: business.websiteUrl,
            displayOrder: business.displayOrder,
            isFeatured: business.isFeatured,
            translations: business.translations.length
              ? business.translations.map((t) => ({
                  locale: t.locale as "en" | "ar",
                  name: t.name,
                  tagline: t.tagline,
                  description: t.description,
                }))
              : [
                  { locale: "en", name: "", tagline: "", description: "" },
                  { locale: "ar", name: "", tagline: "", description: "" },
                ],
          }}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof BusinessNotFoundError) notFound();
    throw error;
  }
}
