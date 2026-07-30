import { prisma, type BlogPost, type Prisma } from "@arqudrix/db";
import type { CreateBlogPostInput, UpdateBlogPostInput, ListBlogPostsQuery } from "./dto";

const TENANT_ID = "arqudrix-core";

export type BlogPostWithTranslation = BlogPost & {
  translations: { locale: string; title: string; excerpt: string; body: string }[];
};

export class ContentRepository {
  async list(query: ListBlogPostsQuery): Promise<{ items: BlogPostWithTranslation[]; total: number }> {
    const where: Prisma.BlogPostWhereInput = {
      tenantId: TENANT_ID,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { translations: { where: { locale: query.locale } } },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { items, total };
  }

  async findBySlug(slug: string, locale: string): Promise<BlogPostWithTranslation | null> {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: { translations: { where: { locale } } },
    });
  }

  async findById(id: string): Promise<BlogPostWithTranslation | null> {
    return prisma.blogPost.findFirst({
      where: { id, tenantId: TENANT_ID },
      include: { translations: true },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.blogPost.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return existing !== null;
  }

  async create(input: CreateBlogPostInput, authorId: string): Promise<BlogPost> {
    return prisma.blogPost.create({
      data: {
        tenantId: TENANT_ID,
        slug: input.slug,
        status: input.status,
        coverImageUrl: input.coverImageUrl,
        authorId,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        translations: {
          create: input.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            body: t.body,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          })),
        },
      },
    });
  }

  async update(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
    return prisma.$transaction(async (tx) => {
      const { translations, ...scalarFields } = input;
      const current = await tx.blogPost.findUniqueOrThrow({ where: { id } });

      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          ...scalarFields,
          publishedAt:
            scalarFields.status === "PUBLISHED" && !current.publishedAt
              ? new Date()
              : current.publishedAt,
        },
      });

      if (translations) {
        for (const t of translations) {
          await tx.blogPostTranslation.upsert({
            where: { blogPostId_locale: { blogPostId: id, locale: t.locale } },
            create: {
              blogPostId: id,
              locale: t.locale,
              title: t.title,
              excerpt: t.excerpt,
              body: t.body,
              metaTitle: t.metaTitle,
              metaDescription: t.metaDescription,
            },
            update: {
              title: t.title,
              excerpt: t.excerpt,
              body: t.body,
              metaTitle: t.metaTitle,
              metaDescription: t.metaDescription,
            },
          });
        }
      }

      return updated;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.blogPost.delete({ where: { id } });
  }
}

export const contentRepository = new ContentRepository();
