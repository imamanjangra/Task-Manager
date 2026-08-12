import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

import type { LoginBody, RegisterBody, updateUserBody } from "../validators/auth.validator.js";
import type {  SafeUser } from "../types/user.types.js";


import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import {
  accessTokenOptions,
  refreshTokenOptions,
} from "../utils/cookieOptions.js";
import { googleClient } from "../config/google.js";
import { env } from "../validators/env.validator.js";
import { GoogleUserSchema } from "../validators/google.validator.js";
import jwt, { type JwtPayload } from "jsonwebtoken";



interface RefreshTokenPayload {
  id: string;
} 

export const createUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password , confirmPassword  } = req.body;

    const existingUser = await prisma.user.findMany({
      where : {
        email : email
      }
    })

    if (existingUser.length > 0) {
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

    const data = await prisma.$transaction(async (tx) => {

        const result = await tx.user.create({
      data : {
        name : name,
        email : email,
        password : hashedPassword
      }
    })

    const user = result;

    if (!user) {
      res.status(500).json({
        success: false,
        message: "User creation failed",
      });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);

    const refreshToken = generateRefreshToken(user.id);

    await tx.user.update({
      where : {
        id : user.id
      },
      data : {
        refreshTokens : refreshToken
      }
    })

    return { user, accessToken, refreshToken };
    })

    if(!data){
      res.status(500).json({
        success: false,
        message: "User creation failed"
      });
      return;
    }

    const safeUser: SafeUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    };

    res
      .cookie("accessToken", data.accessToken, accessTokenOptions)
      .cookie("refreshToken", data.refreshToken, refreshTokenOptions)
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: safeUser,
        accessToken: data.accessToken
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

    const result = await prisma.user.findMany({
      where : {
        email : email
      }
    })

    if (result.length == 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

     const user = result[0];

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

     await prisma.user.update({
      where : {
        id : user.id
      },
      data : {
        refreshTokens : refreshToken
      }
    })

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

      await prisma.user.updateMany({
        where : {
          refreshTokens : refreshToken
        },
        data : {
          refreshTokens : null
        }
      })
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

         await prisma.user.update({
            where : {
                id : user_id
            },
            data : {
                name : name
            }
        })

        res.status(200).json({
          success : true,
          message : "User updated successfully"
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


        const existingUser = await prisma.user.findMany({
            where : {
                googleId : googleUser.sub
            }
        })

        let user;

        if (existingUser.length > 0) {
            user = existingUser[0];
        } else {

            const emailUser = await prisma.user.findMany({
                where : {
                    email : googleUser.email
                }
            })

            if (emailUser.length > 0) {
                res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists. Login with your existing account first.",
                });
                return;
            }

            const result = await prisma.$transaction(async (tx) => {

              const newUser  = await tx.user.create({
                data : {
                  name : googleUser.name,
                  email : googleUser.email,
                  password : null,
                  googleId : googleUser.sub,
                  auth_provider : "google",
                }
              })

              const newProfile = await tx.profile.create({
                data : {
                  userId : newUser.id,
                  imageUrl : googleUser.picture || null
                }
              })
              return {newUser, newProfile} ;
            })

            user = result.newUser;

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
        await prisma.user.update({
            where : {
                id : user.id
            },
            data : {
                refreshTokens : refreshToken
            }
        });

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

    } catch (error : any) {
        console.error("GOOGLE AUTH ERROR:");
    console.error(error);
    console.error("Message:", error?.message);
    console.error("Response:", error?.response?.data);

    res.status(500).json({
        success: false,
        message: error?.message || "Google authentication failed",
    });
    }
};  


export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
      return;
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(
        refreshToken,
        env.REFRESH_TOKEN_SECRET
      ) as RefreshTokenPayload;
    } catch {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    const result = await prisma.user.findMany({
      where : {
        id : decoded.id
      }
    })

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const user = result[0];

    if (user.refreshTokens !== refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token mismatch",
      });
      return;
    }

    const accessToken = generateAccessToken(
      user.id,
      user.email
    );

    res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .status(200)
      .json({
        success: true,
        accessToken,
      });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};