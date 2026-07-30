import { z } from "zod";
import { BusinessCategory, BusinessStatus } from "@arqudrix/db";

const SUPPORTED_LOCALES = ["en", "ar"] as const;

export const businessTranslationInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const createBusinessSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case, e.g. ar-prime-market"),
  category: z.nativeEnum(BusinessCategory),
  status: z.nativeEnum(BusinessStatus).default(BusinessStatus.PLANNED),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  translations: z
    .array(businessTranslationInputSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) => translations.some((t) => t.locale === "en"),
      "An English (en) translation is required as the fallback locale"
    ),
});

export const updateBusinessSchema = createBusinessSchema.partial().extend({
  translations: z.array(businessTranslationInputSchema).optional(),
});

export const changeBusinessStatusSchema = z.object({
  toStatus: z.nativeEnum(BusinessStatus),
  reason: z.string().max(500).optional(),
});

export const listBusinessesQuerySchema = z.object({
  status: z.nativeEnum(BusinessStatus).optional(),
  category: z.nativeEnum(BusinessCategory).optional(),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type ChangeBusinessStatusInput = z.infer<typeof changeBusinessStatusSchema>;
export type ListBusinessesQuery = z.infer<typeof listBusinessesQuerySchema>;
