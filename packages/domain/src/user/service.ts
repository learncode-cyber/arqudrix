import { prisma, type UserRole, type Prisma } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";
import type { ListUsersQuery, UpdateUserRoleInput, UpdateUserStatusInput } from "./dto";

const TENANT_ID = "arqudrix-core";

export class UserManagementError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = "UserManagementError";
  }
}

export class UserNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`User "${id}" was not found`);
    this.name = "UserNotFoundError";
  }
}

interface ActingUser {
  id: string;
  role: UserRole;
}

export class UserManagementService {
  async list(actor: ActingUser, query: ListUsersQuery) {
    assertPermission(actor.role, "user:read");

    const where: Prisma.UserWhereInput = {
      tenantId: TENANT_ID,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          locale: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async updateRole(actor: ActingUser, targetUserId: string, input: UpdateUserRoleInput) {
    assertPermission(actor.role, "user:update_role");

    if (actor.id === targetUserId && input.role !== "SUPER_ADMIN") {
      throw new UserManagementError(
        "You cannot demote your own account — ask another SUPER_ADMIN to change your role."
      );
    }

    const target = await prisma.user.findFirst({ where: { id: targetUserId, tenantId: TENANT_ID } });
    if (!target) throw new UserNotFoundError(targetUserId);

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: input.role },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.role_changed",
        entityType: "User",
        entityId: targetUserId,
        metadata: { fromRole: target.role, toRole: input.role },
      },
    });

    return updated;
  }

  async updateStatus(actor: ActingUser, targetUserId: string, input: UpdateUserStatusInput) {
    assertPermission(actor.role, "user:suspend");

    if (actor.id === targetUserId) {
      throw new UserManagementError("You cannot change your own account status.");
    }

    const target = await prisma.user.findFirst({ where: { id: targetUserId, tenantId: TENANT_ID } });
    if (!target) throw new UserNotFoundError(targetUserId);

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: input.status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.status_changed",
        entityType: "User",
        entityId: targetUserId,
        metadata: { fromStatus: target.status, toStatus: input.status, reason: input.reason ?? null },
      },
    });

    return updated;
  }
}

export const userManagementService = new UserManagementService();
