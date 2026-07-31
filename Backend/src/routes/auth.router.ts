import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { loginScheme, updateUserSchema, UserRegister } from "../validators/auth.validator.js";
import { createUser, googleCallback, googleLogin, Login, Logout, UpdateUser } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";




const router = Router();

router.post(
    "/register", validate(UserRegister) , createUser
)

router.post(
    '/login' , validate(loginScheme) , Login
)

router.get(
    "/logout"  , Logout
)

router.patch(
    "/updateInfo" , validate(updateUserSchema), authMiddleware,   UpdateUser
)

// google routes

router.get(
    "/google",
    googleLogin
);

router.get(
    "/google/callback",
    googleCallback
);
export default router