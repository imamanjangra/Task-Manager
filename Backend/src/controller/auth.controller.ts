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

    const isMatch = await bcrypt.compare(password, user.password);

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
        user: safeUser
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