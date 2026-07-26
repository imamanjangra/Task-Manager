import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../validators/env.validator.js";
import { AccessTokenPayloadSchema } from "../validators/jwt.validator.js";
import { pool } from "../db/index.js";

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

        const result = await pool.query(
            `
            SELECT id, name, email
            FROM users
            WHERE id = $1
            `,
            [payload.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        // req.user = result.rows[0];

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};