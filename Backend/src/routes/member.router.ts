import { Router } from "express";
// import { validate } from "../middleware/Validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { acceptReq, getMembers, inviteMember, leaveWorkspace, rejectReq, request_get } from "../controller/member.controller.js";
import { validate } from "../middleware/Validate.middleware.js";
import { memberCreateSchema, memberParamsSchema, workspaceParamsSchema } from "../validators/member.validator.js";


const router = Router();


router.post('/invite/:id' , authMiddleware , validate({body : memberCreateSchema , params : memberParamsSchema}) ,  inviteMember);



router.get("/invetaion" , authMiddleware , request_get)


router.get("/accepet/:id" , authMiddleware  , acceptReq)
router.get("/reject/:id" , authMiddleware ,   rejectReq)

router.get("/getMembers/:workspace_id" , authMiddleware , validate({params : workspaceParamsSchema}), getMembers)

router.get("/leaveWorkspace/:workspace_id" , authMiddleware , validate({params : workspaceParamsSchema}), leaveWorkspace)
export default router
