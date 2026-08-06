import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import type { LoginBody, logoutBody, RegisterBody, updateUserBody } from "../validators/auth.validator.js";
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
import { success } from "zod";
import { googleClient } from "../config/google.js";
import { env } from "../validators/env.validator.js";
import { GoogleUserSchema } from "../validators/google.validator.js";

export const createUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password , confirmPassword  } = req.body;

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

    if(password !== confirmPassword){
      res.status(403).json({
        success : false,
        message : "password is not match"
      })
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
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);

    const refreshToken = generateRefreshToken(user.id);

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
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: safeUser,
        accessToken 
      });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
  }
};

export const Login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await pool.query<User>(`select * from users where email=$1`, [
      email,
    ]);

    if (result.rows.length == 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

     const user = result.rows[0];

    if (!user.password) {
      res.status(500).json({
        success: false,
        message: "User password is missing",
      });
      return;
    }

    const isMatch = bcrypt.compare(password, user.password);

    if (!isMatch) {
       res.status(401).json({
        success: false,
        message: "password is not correct",
        
      });
      return
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

     await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);

     const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

     res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: safeUser,
        accessToken
      });
      return;
  } catch (error) {
     if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
  }
};

export const Logout = async (req : Request , res : Response):Promise<void> => {
    try {
        const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await pool.query<logoutBody>(
        `update users set refresh_token = null where refresh_token = $1`,
        [refreshToken],
      );
    }

     res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        success: true,
        message: "Logout successful",
      });
      return
    } catch (error) {
        if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
    }
}

export const UpdateUser = async (req : Request <{} , {} , updateUserBody>, res : Response):Promise<void> => {
    try {
        const {name} = req.body;
        const user_id = req.user?.id;
        console.log(user_id);
        if(!user_id){
            res.status(404).json({
                message : "User id not found"
            })
            return
        }

         await pool.query<updateUserBody>(
            `UPDATE users set name = $1 where id = $2` , [name , user_id]
        )

        res.status(200).json({
            success : true,
            message : "User name updated successfully ",
        })
    } catch (error) {
           if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
    }
}


// google auth 

export const googleLogin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const googleUrl = googleClient.generateAuthUrl({
            access_type: "offline",
            scope: [
                "openid",
                "email",
                "profile",
            ],
            prompt: "select_account",
        });

        res.redirect(googleUrl);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to initialize Google login",
        });
    }
};

export const googleCallback = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { code } = req.query;

        if (typeof code !== "string") {
            res.status(400).json({
                success: false,
                message: "Google authorization code missing",
            });
            return;
        }

        // 1. Exchange authorization code for Google tokens
        const { tokens } = await googleClient.getToken(code);

        if (!tokens.id_token) {
            res.status(401).json({
                success: false,
                message: "Google ID token missing",
            });
            return;
        }

        // 2. Verify Google's ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            res.status(401).json({
                success: false,
                message: "Invalid Google user",
            });
            return;
        }

        // 3. Validate Google data with Zod
        const googleUser = GoogleUserSchema.parse({
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        });

        // 4. Find existing Google user
        const existingUser = await pool.query<User>(
            `
            SELECT *
            FROM users
            WHERE google_id = $1
            `,
            [googleUser.sub]
        );

        let user: User;

        if (existingUser.rows.length > 0) {
            user = existingUser.rows[0];
        } else {

            // 5. Check if email already exists
            const emailUser = await pool.query<User>(
                `
                SELECT *
                FROM users
                WHERE email = $1
                `,
                [googleUser.email]
            );

            if (emailUser.rows.length > 0) {
                res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists. Login with your existing account first.",
                });
                return;
            }

            // 6. Create new user
            const newUser = await pool.query<User>(
                `
                INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        google_id,
                        auth_provider
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING *
                `,
                [
                    googleUser.name,
                    googleUser.email,
                    null,
                    googleUser.sub,
                    "google",
                ]
            );

            user = newUser.rows[0];

            if (!user) {
                res.status(500).json({
                    success: false,
                    message: "Failed to create Google user",
                });
                return;
            }
        }

        // 7. YOUR JWT
        const accessToken = generateAccessToken(
            user.id,
            user.email
        );

        const refreshToken = generateRefreshToken(user.id);

        // 8. Store refresh token
        await pool.query(
            `
            UPDATE users
            SET refresh_token = $1
            WHERE id = $2
            `,
            [refreshToken, user.id]
        );

        // 9. Safe user
        const safeUser: SafeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        // 10. Set YOUR cookies
        res
            .cookie(
                "accessToken",
                accessToken,
                accessTokenOptions
            )
            .cookie(
                "refreshToken",
                refreshToken,
                refreshTokenOptions
            )
            .redirect("http://localhost:5173");

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};  

