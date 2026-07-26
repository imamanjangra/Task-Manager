import {z} from "zod";

export const envSchema = z.object({
    PORT : z
        .coerce
        .number()
        .default(8000),
    
    DB_USER : z
        .string()
        .min(1).max(10),

    DB_HOST : z
        .string()
        .min(1).max(10),

    DB_NAME : z
        .string()
        .min(1).max(20),

    DB_PASSWORD : z
        .string()
        .min(1),

    DB_PORT : z
        .coerce
        .number()

})


export const env = envSchema.parse(process.env)