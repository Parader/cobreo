import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export const diagnosticSchema = z.object({
    company: z.string().trim().min(2).max(160),
    companySize: z.enum(["1-10", "11-50", "51-200", "200+"]),
    challenge: z.string().trim().min(5).max(2000),
    tools: z.string().trim().min(2).max(1000),
    email: z.string().trim().email().max(254),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;
export type DiagnosticInput = z.infer<typeof diagnosticSchema>;
