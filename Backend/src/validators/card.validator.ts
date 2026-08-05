import { z } from "zod";

export const cardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),

  description: z
    .string()
    .max(1000, "Description is too long")
    .optional(),

  assigned_to: z
    .uuid()
    .optional(),

  due_date: z
    .string()
    .datetime()
    .optional(),
}).strict();

export const updateCardSchema = cardSchema.partial();

export const listIdSchema = z.object({
  list_id: z.uuid(),
}).strict();

export const cardIdSchema = z.object({
  card_id: z.uuid(),
}).strict();

export type CardBody = z.infer<typeof cardSchema>;
export type UpdateCardBody = z.infer<typeof updateCardSchema>;
export type ListIdBody = z.infer<typeof listIdSchema>;
export type CardIdBody = z.infer<typeof cardIdSchema>;