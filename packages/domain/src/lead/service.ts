import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma, type Prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";
import type { CreateLeadInput } from "./dto";

export const listLeadsQuerySchema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED", "SPAM"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED", "SPAM"]),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

export class LeadNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Lead "${id}" was not found`);
    this.name = "LeadNotFoundError";
  }
}

interface ActingUser {
  id: string;
  role: UserRole;
}

const TENANT_ID = "arqudrix-core";

export class LeadService {
  /**
   * Captures a public contact-form submission. Deliberately has no RBAC
   * check — this is the one write path in the system meant to be called by
   * anonymous visitors. Abuse protection is instead handled by:
   *   1. Honeypot field validation (rejected upstream by the Zod schema)
   *   2. IP hashing (never store raw IP — privacy) for later rate-limit review
   *   3. `source` tagging so admin can bulk-filter/mark spam
   */
  async submit(input: CreateLeadInput, rawIp: string | null) {
    const ipHash = rawIp ? createHash("sha256").update(rawIp).digest("hex") : null;

    const lead = await prisma.lead.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        message: input.message,
        businessId: input.businessId,
        locale: input.locale,
        ipHash,
        source: "website_contact_form",
      },
    });

    // ARQ OS CRM sync is intentionally deferred (Phase 7 — see master prompt
    // §8). The lead is durably stored in this app's own database first;
    // a background job / queue will later push it to ARQ OS and stamp
    // `arqOsSyncedAt`. This guarantees no lead is ever lost if ARQ OS is
    // unreachable at submission time (graceful degradation requirement).

    return lead;
  }

  async listForAdmin(actor: ActingUser, query: ListLeadsQuery) {
    assertPermission(actor.role, "lead:read");

    const where: Prisma.LeadWhereInput = {
      tenantId: TENANT_ID,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { business: { include: { translations: { where: { locale: "en" } } } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return { items, total };
  }

  async updateStatus(actor: ActingUser, id: string, input: UpdateLeadStatusInput) {
    assertPermission(actor.role, "lead:update");

    const existing = await prisma.lead.findFirst({ where: { id, tenantId: TENANT_ID } });
    if (!existing) throw new LeadNotFoundError(id);

    const updated = await prisma.lead.update({ where: { id }, data: { status: input.status } });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "lead.status_changed",
        entityType: "Lead",
        entityId: id,
        metadata: { fromStatus: existing.status, toStatus: input.status },
      },
    });

    return updated;
  }

  async delete(actor: ActingUser, id: string) {
    assertPermission(actor.role, "lead:delete");

    const existing = await prisma.lead.findFirst({ where: { id, tenantId: TENANT_ID } });
    if (!existing) throw new LeadNotFoundError(id);

    await prisma.lead.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "lead.deleted",
        entityType: "Lead",
        entityId: id,
        metadata: { email: existing.email },
      },
    });
  }
}

export const leadService = new LeadService();
