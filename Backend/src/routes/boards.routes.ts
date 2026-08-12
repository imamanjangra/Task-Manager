import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createBoard, deleteBoard, GetAllBoards , GetBoardsById, UpdateBoard } from "../controller/boards.controller.js";
import { boardParamSchema, boardSchema, boardUserIdSchema, updateBoardSchema } from "../validators/board.validator.js";
import { boardCreationLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();


router.post("/create/:workspace_id" ,boardCreationLimiter, authMiddleware , validate({body : boardSchema , params : boardParamSchema}) ,  createBoard)
router.get("/workspace/:workspace_id" , authMiddleware , validate({params : boardParamSchema }) , GetAllBoards)
router.get("/:id" , authMiddleware , validate({params : boardUserIdSchema }) ,  GetBoardsById)
router.patch("/:id" , boardCreationLimiter, authMiddleware ,validate({params : boardUserIdSchema , body : updateBoardSchema }) ,  UpdateBoard)
router.delete("/:id" , boardCreationLimiter, authMiddleware ,validate({params : boardUserIdSchema }) , deleteBoard)


export default router