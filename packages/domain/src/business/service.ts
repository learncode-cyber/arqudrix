import { prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";
import { businessRepository } from "./repository";
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
  ChangeBusinessStatusInput,
  ListBusinessesQuery,
} from "./dto";

export class BusinessValidationError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = "BusinessValidationError";
  }
}

export class BusinessNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Business "${id}" was not found`);
    this.name = "BusinessNotFoundError";
  }
}

interface ActingUser {
  id: string;
  role: UserRole;
}

/**
 * Business application service (DDD application layer).
 *
 * This is the ONLY entry point admin route handlers and public read paths
 * should call. It is responsible for:
 *   1. Authorization (via @arqudrix/auth::assertPermission)
 *   2. Domain invariants (slug uniqueness, valid status transitions)
 *   3. Audit logging of every mutation
 *
 * The repository layer below it knows nothing about permissions or audit —
 * that separation keeps persistence logic testable in isolation.
 */
export class BusinessService {
  /** Public read — used by apps/web to render the /businesses card grid. No auth required. */
  async listPublished(query: Omit<ListBusinessesQuery, "status"> & { status?: never }) {
    return businessRepository.list({ ...query, status: undefined });
  }

  async getBySlugPublic(slug: string, locale: string) {
    const business = await businessRepository.findBySlug(slug, locale);
    if (!business) throw new BusinessNotFoundError(slug);
    return business;
  }

  /** Admin read — includes all statuses (PLANNED, ARCHIVED, etc.), any locale. */
  async listForAdmin(actor: ActingUser, query: ListBusinessesQuery) {
    assertPermission(actor.role, "business:read");
    return businessRepository.list(query);
  }

  async getByIdForAdmin(actor: ActingUser, id: string) {
    assertPermission(actor.role, "business:read");
    const business = await businessRepository.findById(id);
    if (!business) throw new BusinessNotFoundError(id);
    return business;
  }

  async create(actor: ActingUser, input: CreateBusinessInput) {
    assertPermission(actor.role, "business:create");

    const slugTaken = await businessRepository.slugExists(input.slug);
    if (slugTaken) {
      throw new BusinessValidationError(`Slug "${input.slug}" is already in use`);
    }

    const created = await businessRepository.create(input, actor.id);

    await this.writeAuditLog(actor.id, "business.created", "Business", created.id, {
      slug: created.slug,
      status: created.status,
    });

    return created;
  }

  async update(actor: ActingUser, id: string, input: UpdateBusinessInput) {
    assertPermission(actor.role, "business:update");

    const existing = await businessRepository.findById(id);
    if (!existing) throw new BusinessNotFoundError(id);

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await businessRepository.slugExists(input.slug, id);
      if (slugTaken) {
        throw new BusinessValidationError(`Slug "${input.slug}" is already in use`);
      }
    }

    const updated = await businessRepository.update(id, input);

    await this.writeAuditLog(actor.id, "business.updated", "Business", id, {
      changedFields: Object.keys(input),
    });

    return updated;
  }

  async changeStatus(actor: ActingUser, id: string, input: ChangeBusinessStatusInput) {
    assertPermission(actor.role, "business:change_status");

    const existing = await businessRepository.findById(id);
    if (!existing) throw new BusinessNotFoundError(id);

    if (existing.status === input.toStatus) {
      throw new BusinessValidationError(
        `Business is already in status "${input.toStatus}"`
      );
    }

    const updated = await businessRepository.changeStatus(
      id,
      input.toStatus,
      actor.id,
      input.reason
    );

    await this.writeAuditLog(actor.id, "business.status_changed", "Business", id, {
      fromStatus: existing.status,
      toStatus: input.toStatus,
      reason: input.reason ?? null,
    });

    return updated;
  }

  async delete(actor: ActingUser, id: string) {
    assertPermission(actor.role, "business:delete");

    const existing = await businessRepository.findById(id);
    if (!existing) throw new BusinessNotFoundError(id);

    await businessRepository.delete(id);

    await this.writeAuditLog(actor.id, "business.deleted", "Business", id, {
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
    await prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata },
    });
  }
}

export const businessService = new BusinessService();
