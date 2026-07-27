import {z} from "zod"


export const envSchema = z.object({
    PORT : z
        .coerce
        .number()
        .positive()
        .default(8000),
    
    DB_USER : z
        .string()
        .min(1).max(10),

    DB_HOST : z
        .string()
        .min(1),

    DB_NAME : z
        .string()
        .min(1),

    DB_PASSWORD : z
        .string()
        .min(1),

    DB_PORT : z
        .coerce
        .number()
        .int()
        .positive(),
    
    ACCESS_TOKEN_SECRET: z
        .string()
        .min(32),
        
    REFRESH_TOKEN_SECRET: z
        .string()
        .min(32),

})


export const env = envSchema.parse(process.env)
