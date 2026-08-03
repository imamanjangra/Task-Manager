import { TypeOf, z } from "zod";


export const boardSchema = z.object({
    name  : z
        .string()
        .max(100 , "Name is too much high"),

    description : z
        .string()
        .max(1000 , "description is too much high")
}).strict();

export const boardParamSchema = z.object({
    workspace_id : z
        .uuid()
}).strict();

export const boardUserIdSchema = z.object({
    id : z
        .uuid()
})

export const updateBoardSchema = boardSchema.partial();

export type bordBody = z.infer<typeof boardSchema>;
export type bordParamsBody = z.infer<typeof boardParamSchema>;
export type bordUserIdBody = z.infer<typeof boardUserIdSchema>;
export type updateBoardsBody = z.infer<typeof updateBoardSchema>;