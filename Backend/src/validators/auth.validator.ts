import {email, z} from "zod";

export const UserRegister = z.object({
    name : z
        .string()
        .min(2 , "Name is to short")
        .max(30 , "Name is too much big"),
    
    email : z
        .string()
        .email("invalid email")
        .trim(),

    password : z 
    .string()
    .min(8 , "minimum 8 character")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
}).strict();


export const paramsvalue = z.object({
    id : z
    .coerce
    .number()
    .int()
    .positive()
}).strict();

export const loginScheme = z.object({
    email : z
    .string()
    .trim()
    .email("Invalid email address"),

    password : z
    .string()
    .min(1 , "must be required")
}).strict();

export const LogoutSchema = z.object({
    refresh_token : z
        .string()
})

export const UserSchema  = UserRegister.extend({
    id : z.string()
})

export const SafeUserSchema = UserSchema.omit({
    password : true
})

export const updateUserSchema = UserSchema.partial();

export type RegisterBody = z.infer<typeof UserRegister>
export type LoginBody = z.infer<typeof loginScheme>
export type ParamsBody = z.infer<typeof paramsvalue>
export type safeUser = z.infer<typeof SafeUserSchema>
export type logoutBody = z.infer<typeof LogoutSchema>
export type updateUserBody = z.infer<typeof updateUserSchema>