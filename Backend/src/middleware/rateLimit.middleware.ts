import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,

  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const GoogleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,

  message: {
    success: false,
    message: "Too many Google registration attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const workspaceCreationLimiter = rateLimit({
    windowMs : 60 * 60 * 1000,
    limit : 20,

    message : {
        success : false,
        message : "Too many workspace creation attempts. Please try again later."
    },
    standardHeaders : true,
    legacyHeaders : false
})

export const boardCreationLimiter = rateLimit({
    windowMs : 60 * 60 * 1000,
    limit : 50,    

    message : {
        success : false,
        message : "Too many board creation attempts. Please try again later."   
    },

    standardHeaders : true,
    legacyHeaders : false
})