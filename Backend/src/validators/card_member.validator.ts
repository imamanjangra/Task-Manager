import { z } from "zod";

export const cardsMemberchema = z.object({

  user_id: z
    .uuid()


}).strict();

export const CardIdSchema = z.object({
  card_id: z.uuid(),
}).strict();


export const card_user_idSchema = z.object({
    card_id : z.uuid(),
    user_id : z.uuid()
})


export type CardBody = z.infer<typeof cardsMemberchema>;
export type ListIdBody = z.infer<typeof CardIdSchema>;
export type card_user_id_Body = z.infer<typeof card_user_idSchema>