import { prisma, type Business, type BusinessStatus, type Prisma } from "@arqudrix/db";
import type { CreateBusinessInput, UpdateBusinessInput, ListBusinessesQuery } from "./dto";

const TENANT_ID = "arqudrix-core";

export type BusinessWithTranslation = Business & {
  translations: { locale: string; name: string; tagline: string; description: string }[];
};

export class BusinessRepository {
  async list(query: ListBusinessesQuery): Promise<{ items: BusinessWithTranslation[]; total: number }> {
    const where: Prisma.BusinessWhereInput = {
      tenantId: TENANT_ID,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: { translations: { where: { locale: query.locale } } },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.business.count({ where }),
    ]);

    return { items, total };
  }

  async findBySlug(slug: string, locale: string): Promise<BusinessWithTranslation | null> {
    return prisma.business.findUnique({
      where: { slug },
      include: { translations: { where: { locale } } },
    });
  }

  async findById(id: string): Promise<BusinessWithTranslation | null> {
    return prisma.business.findFirst({
      where: { id, tenantId: TENANT_ID },
      include: { translations: true },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.business.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return existing !== null;
  }

  async create(input: CreateBusinessInput, createdById: string): Promise<Business> {
    return prisma.business.create({
      data: {
        tenantId: TENANT_ID,
        slug: input.slug,
        category: input.category,
        status: input.status,
        logoUrl: input.logoUrl,
        coverImageUrl: input.coverImageUrl,
        websiteUrl: input.websiteUrl,
        displayOrder: input.displayOrder,
        isFeatured: input.isFeatured,
        createdById,
        translations: {
          create: input.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            tagline: t.tagline,
            description: t.description,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          })),
        },
      },
    });
  }

  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    return prisma.$transaction(async (tx) => {
      const { translations, ...scalarFields } = input;

      const updated = await tx.business.update({
        where: { id },
        data: scalarFields,
      });

      if (translations) {
        for (const t of translations) {
          await tx.businessTranslation.upsert({
            where: { businessId_locale: { businessId: id, locale: t.locale } },
            create: {
              businessId: id,
              locale: t.locale,
              name: t.name,
              tagline: t.tagline,
              description: t.description,
              metaTitle: t.metaTitle,
              metaDescription: t.metaDescription,
            },
            update: {
              name: t.name,
              tagline: t.tagline,
              description: t.description,
              metaTitle: t.metaTitle,
              metaDescription: t.metaDescription,
            },
          });
        }
      }

      return updated;
    });
  }

  async changeStatus(id: string, toStatus: BusinessStatus, changedById: string, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.business.findUniqueOrThrow({ where: { id } });

      const updated = await tx.business.update({
        where: { id },
        data: {
          status: toStatus,
          launchedAt: toStatus === "ACTIVE" && !current.launchedAt ? new Date() : current.launchedAt,
        },
      });

      await tx.businessStatusLog.create({
        data: {
          businessId: id,
          fromStatus: current.status,
          toStatus,
          changedById,
          reason,
        },
      });

      return updated;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.business.delete({ where: { id } });
  }
}

export const businessRepository = new BusinessRepository();
