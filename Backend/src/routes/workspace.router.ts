import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { UpdateWorkSpaceSchema, WorkspaceParamsSchema, WorkspaceSchema } from "../validators/workspace.validator.js";
import { CreateWorkspace, DeleteWorkspace, GetAllWorkSpace, getWorkspaceById, UpdateWorkSpace } from "../controller/Workspace.controller.js";
import { inviteMember, request_get } from "../controller/member.controller.js";
import { memberCreateSchema, memberParamsSchema } from "../validators/member.validator.js";

const router = Router();
router.get('/invitations' , authMiddleware , request_get)

router.post("/create" , authMiddleware , validate({ body : WorkspaceSchema}) , CreateWorkspace)

router.patch("/update/:id" , authMiddleware , validate( {body :UpdateWorkSpaceSchema}) , UpdateWorkSpace)

router.get("/" , authMiddleware , GetAllWorkSpace );

router.get("/:id" , authMiddleware , validate({ params: WorkspaceParamsSchema}) , getWorkspaceById)

router.delete("/delete/:id" , authMiddleware , validate( {params:WorkspaceParamsSchema}) , DeleteWorkspace)

// member router in wrokspace 

router.post('/invite/:id' , authMiddleware , validate({body : memberCreateSchema , params : memberParamsSchema}) ,  inviteMember);
export default router

