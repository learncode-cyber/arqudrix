import { z } from "zod";

export const createLeadSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(30).optional(),
  company: z.string().max(120).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  businessId: z.string().cuid().optional(),
  locale: z.enum(["en", "ar"]).default("en"),
  // Honeypot field — real users never fill this; bots frequently do.
  website: z.string().max(0, "Spam detected").optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
