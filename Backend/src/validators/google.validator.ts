import { z } from "zod";

export const GoogleUserSchema = z.object({
    sub: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
    picture: z.string().url().optional(),
});

export type GoogleUser = z.infer<typeof GoogleUserSchema>;