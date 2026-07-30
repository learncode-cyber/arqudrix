import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { contentService, listBlogPostsQuerySchema } from "@arqudrix/domain";
import { ContentTable } from "./content-table";

export const metadata = { title: "Content / Blog" };

export default async function ContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const query = listBlogPostsQuerySchema.parse({ locale: "en", pageSize: 100 });
  const { items, total } = await contentService.listForAdmin(
    { id: session.user.id, role: session.user.role },
    query
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content / Blog</h1>
          <p className="mt-1 text-sm text-slate-500">{total} posts — powers /blog and AEO/GEO-optimized article pages.</p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          + New Post
        </Link>
      </div>

      <ContentTable initialItems={items} />
    </div>
  );
}
