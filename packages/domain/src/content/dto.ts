import { z } from "zod";
import { ContentStatus } from "@arqudrix/db";

const SUPPORTED_LOCALES = ["en", "ar"] as const;

export const blogPostTranslationInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(300),
  body: z.string().min(50, "Body must be at least 50 characters"),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const createBlogPostSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  coverImageUrl: z.string().url().optional().nullable(),
  translations: z
    .array(blogPostTranslationInputSchema)
    .min(1)
    .refine(
      (translations) => translations.some((t) => t.locale === "en"),
      "An English (en) translation is required as the fallback locale"
    ),
});

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  translations: z.array(blogPostTranslationInputSchema).optional(),
});

export const listBlogPostsQuerySchema = z.object({
  status: z.nativeEnum(ContentStatus).optional(),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type ListBlogPostsQuery = z.infer<typeof listBlogPostsQuerySchema>;
