import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../validators/env.validator.js";
import { AccessTokenPayloadSchema } from "../validators/jwt.validator.js";
import { prisma } from "../lib/prisma.js";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(
            token,
            env.ACCESS_TOKEN_SECRET
        );

        const payload = AccessTokenPayloadSchema.parse(decoded);


        const result = await prisma.user.findMany({
            where : {
                id : payload.id 
            },
            select : {
                id : true,
                name : true,
                email : true
            }
        })

        if (result.length === 0) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        req.user = result[0];

        next();
    } catch (error) {
            if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
    }
};