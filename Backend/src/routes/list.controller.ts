import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createList, deleteList, getAllLists, getListById, updateList } from "../controller/list.controller.js";
import { board_idSchema, createListSchema, listIdParamsSchema } from "../validators/list.validator.js";


const router = Router();

router.post("/create/:board_id" , authMiddleware ,validate({params : board_idSchema , body: createListSchema}) ,  createList)
router.get("/:board_id" , authMiddleware , validate({params : board_idSchema}) , getAllLists)
router.get("/id/:list_id" , authMiddleware ,validate({params : listIdParamsSchema}) , getListById );
router.patch("/:list_id" , authMiddleware ,validate({params : listIdParamsSchema , body: createListSchema}) , updateList )
router.delete("/:list_id" , authMiddleware ,validate({params : listIdParamsSchema}) , deleteList );



export default router