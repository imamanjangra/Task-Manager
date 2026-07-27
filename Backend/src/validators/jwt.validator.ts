import { email, z } from "zod";


export const AccessTokenPayloadSchema = z.object({
    id : z
        .string(),

    email : z
        .string()
        .email(),
})