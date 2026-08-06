import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
    email: z.email("Please enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters"),
    
    name : z
        .string()
        .min(2 , "Name is too much short")
    
})


export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
