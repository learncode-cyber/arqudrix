import { z } from "zod";
import { prisma, InquiryType, InquiryStatus, type UserRole } from "@arqudrix/db";

export const createInquirySchema = z.object({
  type: z.nativeEnum(InquiryType),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  body: z.string().min(10, "Please provide more detail (at least 10 characters)").max(5000),
});

export const listInquiriesQuerySchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type ListInquiriesQuery = z.infer<typeof listInquiriesQuerySchema>;

export class InquiryNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Inquiry "${id}" was not found`);
    this.name = "InquiryNotFoundError";
  }
}

interface ActingUser {
  id: string;
  role: UserRole;
}

const TENANT_ID = "arqudrix-core";

/**
 * Every method here is scoped to the acting user's OWN inquiries — there is
 * deliberately no "list all inquiries across all users" method in this
 * service. Cross-user visibility belongs to a future admin-side
 * `AdminInquiryService`, kept separate so a bug here can never leak one
 * customer's support thread to another (tenant/customer data isolation,
 * master prompt §15).
 */
export class InquiryService {
  async listOwn(actor: ActingUser, query: ListInquiriesQuery) {
    const where = {
      tenantId: TENANT_ID,
      userId: actor.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { items, total };
  }

  async getOwnById(actor: ActingUser, id: string) {
    const inquiry = await prisma.inquiry.findFirst({
      where: { id, userId: actor.id, tenantId: TENANT_ID },
    });
    if (!inquiry) throw new InquiryNotFoundError(id);
    return inquiry;
  }

  async create(actor: ActingUser, input: CreateInquiryInput) {
    const inquiry = await prisma.inquiry.create({
      data: {
        tenantId: TENANT_ID,
        userId: actor.id,
        type: input.type,
        subject: input.subject,
        body: input.body,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "inquiry.created",
        entityType: "Inquiry",
        entityId: inquiry.id,
        metadata: { type: input.type },
      },
    });

    return inquiry;
  }
}

export const inquiryService = new InquiryService();
