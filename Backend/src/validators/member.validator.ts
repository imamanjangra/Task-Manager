import { z } from "zod";


export const memberCreateSchema = z.object({
    receiver_email : z
        .string()
        .email()
        .trim(),

    role : z
        .string(),

    // status : z
    //     .enum(["Pending" , "Accepeted"])

})

export const memberParamsSchema = z.object({
    id : z
        .uuid()
})

export type memberCreateBody = z.infer<typeof memberCreateSchema>
export type memberParamsBody = z.infer<typeof memberParamsSchema>