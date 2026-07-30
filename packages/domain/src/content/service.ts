import { prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";
import { contentRepository } from "./repository";
import type { CreateBlogPostInput, UpdateBlogPostInput, ListBlogPostsQuery } from "./dto";

export class ContentValidationError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export class ContentNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Blog post "${id}" was not found`);
    this.name = "ContentNotFoundError";
  }
}

interface ActingUser {
  id: string;
  role: UserRole;
}

export class ContentService {
  /** Public read — apps/web blog listing. Only ever returns PUBLISHED posts. */
  async listPublished(query: Omit<ListBlogPostsQuery, "status">) {
    return contentRepository.list({ ...query, status: "PUBLISHED" });
  }

  async getBySlugPublic(slug: string, locale: string) {
    const post = await contentRepository.findBySlug(slug, locale);
    if (!post || post.status !== "PUBLISHED") {
      throw new ContentNotFoundError(slug);
    }
    return post;
  }

  async listForAdmin(actor: ActingUser, query: ListBlogPostsQuery) {
    assertPermission(actor.role, "content:read");
    return contentRepository.list(query);
  }

  async getByIdForAdmin(actor: ActingUser, id: string) {
    assertPermission(actor.role, "content:read");
    const post = await contentRepository.findById(id);
    if (!post) throw new ContentNotFoundError(id);
    return post;
  }

  async create(actor: ActingUser, input: CreateBlogPostInput) {
    assertPermission(actor.role, input.status === "PUBLISHED" ? "content:publish" : "content:create");

    const slugTaken = await contentRepository.slugExists(input.slug);
    if (slugTaken) {
      throw new ContentValidationError(`Slug "${input.slug}" is already in use`);
    }

    const created = await contentRepository.create(input, actor.id);

    await this.writeAuditLog(actor.id, "blog_post.created", "BlogPost", created.id, {
      slug: created.slug,
      status: created.status,
    });

    return created;
  }

  async update(actor: ActingUser, id: string, input: UpdateBlogPostInput) {
    const existing = await contentRepository.findById(id);
    if (!existing) throw new ContentNotFoundError(id);

    const isPublishing = input.status === "PUBLISHED" && existing.status !== "PUBLISHED";
    assertPermission(actor.role, isPublishing ? "content:publish" : "content:create");

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await contentRepository.slugExists(input.slug, id);
      if (slugTaken) {
        throw new ContentValidationError(`Slug "${input.slug}" is already in use`);
      }
    }

    const updated = await contentRepository.update(id, input);

    await this.writeAuditLog(actor.id, "blog_post.updated", "BlogPost", id, {
      changedFields: Object.keys(input),
    });

    return updated;
  }

  async delete(actor: ActingUser, id: string) {
    assertPermission(actor.role, "content:delete");

    const existing = await contentRepository.findById(id);
    if (!existing) throw new ContentNotFoundError(id);

    await contentRepository.delete(id);

    await this.writeAuditLog(actor.id, "blog_post.deleted", "BlogPost", id, {
      slug: existing.slug,
    });
  }

  private async writeAuditLog(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>
  ) {
    await prisma.auditLog.create({ data: { actorId, action, entityType, entityId, metadata } });
  }
}

export const contentService = new ContentService();
