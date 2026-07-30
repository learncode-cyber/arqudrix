import { z } from "zod";
import { UserRole, UserStatus } from "@arqudrix/db";

export const listUsersQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().max(500).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
