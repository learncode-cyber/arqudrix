import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { contentService, ContentNotFoundError } from "@arqudrix/domain";
import { ContentForm } from "../../content-form";

export const metadata = { title: "Edit Post" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;

  try {
    const post = await contentService.getByIdForAdmin(
      { id: session.user.id, role: session.user.role },
      id
    );

    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Edit — {post.translations.find((t) => t.locale === "en")?.title ?? post.slug}
        </h1>
        <ContentForm
          mode="edit"
          postId={post.id}
          defaultValues={{
            slug: post.slug,
            status: post.status,
            coverImageUrl: post.coverImageUrl,
            translations: post.translations.length
              ? post.translations.map((t) => ({
                  locale: t.locale as "en" | "ar",
                  title: t.title,
                  excerpt: t.excerpt,
                  body: t.body,
                }))
              : [
                  { locale: "en", title: "", excerpt: "", body: "" },
                  { locale: "ar", title: "", excerpt: "", body: "" },
                ],
          }}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ContentNotFoundError) notFound();
    throw error;
  }
}
