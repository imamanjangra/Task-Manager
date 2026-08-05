import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { CardIdSchema, cardsMemberchema } from "../validators/card_member.validator.js";
import { AssignedMember, AssignMember, RemoveMember } from "../controller/card_members.controller.js";

const router = Router();

router.post("/:card_id/members" , authMiddleware , validate({params : CardIdSchema , body : cardsMemberchema}) , AssignMember)
router.delete("/:card_id/members" , authMiddleware , validate({params : CardIdSchema } )   , RemoveMember);
router.get("/:card_id/members" , authMiddleware ,  validate({params : CardIdSchema } )  , AssignedMember )


export default router