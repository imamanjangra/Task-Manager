import { z } from "zod";


export const WorkspaceSchema = z.object({
    name : z
        .string()
        .min(2 , "Name is to much short")
        .max(100 , "Name is too much big"),

    description  : z
        .string()
        .min(2 , "description is to much short")
        .max(500 , "description is too much big"),

    
})

export const updateSchema = WorkspaceSchema.extend({
    id : z
        .uuid()
})

export const UpdateWorkSpaceSchema = updateSchema.partial();

export const WorkspaceParamsSchema = z.object({
    id : z
        .uuid()
})

export type WorkSpaceBody = z.infer<typeof WorkspaceSchema>
export type UpdateWorkSpaceBody = z.infer<typeof UpdateWorkSpaceSchema>
export type WorkspaceParamsBody = z.infer<typeof WorkspaceParamsSchema>

