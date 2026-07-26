import { email, z } from "zod";


export const AccessTokenPayloadSchema = z.object({
    id : z
        .coerce
        .number()
        .int()
        .positive(),

    email : z
        .string()
        .email(),
}).strict()