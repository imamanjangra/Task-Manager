import { uuid, z } from "zod";



export const createListSchema = z.object({
    name : z
        .string()
        .min(2 , "name is too short ")
        .max(200 , "name is too much big"),
}).strict();

export const board_idSchema = z.object({
     board_id : z
        .uuid()
}).strict();

export const listIdParamsSchema = z.object({
    list_id : z
        .uuid()
}).strict();

export type listId_Body = z.infer<typeof listIdParamsSchema>
export type ListBody = z.infer<typeof createListSchema>
export type board_idBody = z.infer<typeof board_idSchema>
