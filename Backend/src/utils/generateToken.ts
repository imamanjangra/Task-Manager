import jwt from "jsonwebtoken";
import { env } from "../validators/env.validator.js";


export const generateAccessToken = (userId : string , email : string) => {
    return jwt.sign(
        {
            id : userId,
            email ,
        },
        env.ACCESS_TOKEN_SECRET,
        {
              expiresIn: "5d",
        }
    )
}

export const generateRefreshToken = (userId : string ) => {
    return jwt.sign(
        {
            id : userId,
        },
        env.REFRESH_TOKEN_SECRET,
        {
              expiresIn: "10d",
        }
    )
}

