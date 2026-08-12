import { Router } from "express";
import { validate } from "../middleware/Validate.middleware.js";
import { loginScheme, updateUserSchema, UserRegister } from "../validators/auth.validator.js";
import { createUser, googleCallback, googleLogin, Login, Logout, refreshAccessToken, UpdateUser } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { registerLimiter , loginLimiter, GoogleLimiter } from "../middleware/rateLimit.middleware.js";


const router = Router();

router.post(
    "/register",registerLimiter, validate({body : UserRegister}) , createUser
)

router.post(
'/login' , loginLimiter, validate({body : loginScheme}) , Login
)

router.get(
    "/logout"  , Logout
)

router.patch(
    "/updateInfo" , validate({body : updateUserSchema}), authMiddleware,   UpdateUser
)
router.post("/refresh-token", refreshAccessToken);

// google routes

router.get(
    "/google",
    GoogleLimiter,
    googleLogin
);

router.get(
    "/google/callback",
    GoogleLimiter,
    googleCallback
);


export default router