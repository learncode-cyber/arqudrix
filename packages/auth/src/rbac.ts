import type { UserRole } from "@arqudrix/db";

/**
 * RBAC Permission Matrix
 * -----------------------
 * Single source of truth for authorization decisions across the public
 * site, client portal, and the /admin panel (all now one Next.js app —
 * see README "Single-app deployment"). Every sensitive route handler MUST
 * call `can()` before
 * performing a mutation. Never infer permissions ad-hoc inside a component
 * or route handler — always go through this module so a security review
 * only has one file to audit.
 */

export type Permission =
  | "business:read"
  | "business:create"
  | "business:update"
  | "business:delete"
  | "business:change_status"
  | "lead:read"
  | "lead:update"
  | "lead:delete"
  | "user:read"
  | "user:update_role"
  | "user:suspend"
  | "content:read"
  | "content:create"
  | "content:publish"
  | "content:delete"
  | "audit_log:read"
  | "integration:read"
  | "integration:manage_credentials";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PUBLIC_USER: [],
  CUSTOMER: ["content:read"],
  CLIENT: ["content:read"],
  PARTNER: ["content:read"],
  SUPPLIER: ["content:read"],
  INVESTOR: ["content:read"],
  EMPLOYEE: ["business:read", "lead:read", "content:read"],
  MANAGER: [
    "business:read",
    "business:update",
    "lead:read",
    "lead:update",
    "content:read",
    "content:create",
  ],
  ADMIN: [
    "business:read",
    "business:create",
    "business:update",
    "business:delete",
    "business:change_status",
    "lead:read",
    "lead:update",
    "lead:delete",
    "user:read",
    "content:read",
    "content:create",
    "content:publish",
    "content:delete",
    "audit_log:read",
    "integration:read",
  ],
  // SUPER_ADMIN is the only role that can change other users' roles or
  // manage integration credentials — deliberately excluded from ADMIN so a
  // compromised admin account cannot escalate itself or exfiltrate secrets.
  SUPER_ADMIN: [
    "business:read",
    "business:create",
    "business:update",
    "business:delete",
    "business:change_status",
    "lead:read",
    "lead:update",
    "lead:delete",
    "user:read",
    "user:update_role",
    "user:suspend",
    "content:read",
    "content:create",
    "content:publish",
    "content:delete",
    "audit_log:read",
    "integration:read",
    "integration:manage_credentials",
  ],
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError(
      `Role "${role}" lacks required permission "${permission}"`
    );
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Roles permitted to access the /admin panel at all. */
export const ADMIN_SURFACE_ROLES: UserRole[] = ["EMPLOYEE", "MANAGER", "ADMIN", "SUPER_ADMIN"];
