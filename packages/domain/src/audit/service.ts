import { z } from "zod";
import { prisma, type Prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";

const TENANT_ID = "arqudrix-core";

export const listAuditLogsQuerySchema = z.object({
  entityType: z.string().max(50).optional(),
  action: z.string().max(100).optional(),
  actorId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

interface ActingUser {
  id: string;
  role: UserRole;
}

/**
 * Audit logs are strictly read-only from the application layer — nothing in
 * this codebase ever updates or deletes an AuditLog row. That immutability
 * is what makes it trustworthy as a governance record (master prompt §7:
 * "Every sensitive administrative action must be logged").
 */
export class AuditLogService {
  async list(actor: ActingUser, query: ListAuditLogsQuery) {
    assertPermission(actor.role, "audit_log:read");

    const where: Prisma.AuditLogWhereInput = {
      tenantId: TENANT_ID,
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, fullName: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}

export const auditLogService = new AuditLogService();
