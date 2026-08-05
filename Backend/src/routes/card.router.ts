import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createCard, deleteCard, getAllCards, getCardById, updateCard } from "../controller/card.controller.js";
import { cardIdSchema, cardSchema, updateCardSchema } from "../validators/card.validator.js";
import { listIdParamsSchema } from "../validators/list.validator.js";



const router = Router();

router.post("/create/:list_id" , authMiddleware , validate({body : cardSchema , params : listIdParamsSchema}) , createCard)
router.get("/:list_id" , authMiddleware , validate({ params : listIdParamsSchema}) , getAllCards);
router.get("/id/:card_id" , authMiddleware , validate({params : cardIdSchema}) , getCardById)
router.patch("/:card_id" , authMiddleware , validate({params : cardIdSchema , body : updateCardSchema}) , updateCard)
router.delete("/:card_id" , authMiddleware , validate({params : cardIdSchema }) , deleteCard)



export default router