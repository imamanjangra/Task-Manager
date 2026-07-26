import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { UserRegister } from "../validators/auth.validator.js";
import { createUser } from "../controller/auth.controller.js";




const router = Router();

router.post(
    "/register", validate(UserRegister) , createUser
)

export default router