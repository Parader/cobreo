import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export const diagnosticSchema = z
    .object({
        name: z.string().trim().min(2).max(120),
        company: z.string().trim().max(160).optional().or(z.literal("")),
        contact: z.string().trim().min(5).max(254),
        summary: z.string().trim().max(2000).optional().or(z.literal("")),
        answers: z.string().trim().min(2).max(100_000),
        website: z.string().max(0).optional().or(z.literal("")), // honeypot
    })
    .superRefine((data, ctx) => {
        const value = data.contact;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^[+\d\s().-]{7,40}$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 7;
        if (!isEmail && !isPhone) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contact"],
                message: "invalid_contact",
            });
        }
    });

export type ContactInput = z.infer<typeof contactSchema>;
export type DiagnosticInput = z.infer<typeof diagnosticSchema>;
