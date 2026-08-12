import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { UpdateWorkSpaceSchema, WorkspaceParamsSchema, WorkspaceSchema } from "../validators/workspace.validator.js";
import { CreateWorkspace, DeleteWorkspace, GetAllWorkSpace, getWorkspaceById, UpdateWorkSpace } from "../controller/Workspace.controller.js";
import { workspaceCreationLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/create" ,workspaceCreationLimiter, authMiddleware , validate({ body : WorkspaceSchema}) , CreateWorkspace)

router.patch("/update/:id" , workspaceCreationLimiter, authMiddleware , validate( {body :UpdateWorkSpaceSchema}) , UpdateWorkSpace)

router.get("/" , authMiddleware , GetAllWorkSpace );

router.get("/:id" , authMiddleware , validate({ params: WorkspaceParamsSchema}) , getWorkspaceById)

router.delete("/delete/:id" , workspaceCreationLimiter, authMiddleware , validate( {params:WorkspaceParamsSchema}) , DeleteWorkspace)


export default router
