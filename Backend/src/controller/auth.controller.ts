import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import type { RegisterBody } from "../validators/auth.validator.js";
import type { User, SafeUser } from "../types/user.types.js";

import { pool } from "../db/index.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";

import {
    accessTokenOptions,
    refreshTokenOptions,
} from "../utils/cookieOptions.js";

export const createUser = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await pool.query<Pick<User, "id">>(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            [email],
        );

        if (existingUser.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: "User already exists",
            });
             return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query<User>(
            `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, email, hashedPassword],
        );

        const user = result.rows[0];

        if (!user) {
             res.status(500).json({
                success: false,
                message: "User creation failed",
            });
            return
        }

        const accessToken = generateAccessToken(
            user.id,
            user.email,
        );

        const refreshToken = generateRefreshToken(
            user.id,
        );

        await pool.query(
            `
            UPDATE users
            SET refresh_token = $1
            WHERE id = $2
            `,
            [refreshToken, user.id],
        );

        const safeUser: SafeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

         res
            .cookie(
                "accessToken",
                accessToken,
                accessTokenOptions,
            )
            .cookie(
                "refreshToken",
                refreshToken,
                refreshTokenOptions,
            )
            .status(201)
            .json({
                success: true,
                message: "User registered successfully",
                user: safeUser,
            });
            return

    } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message , stack : error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }

    }
};

