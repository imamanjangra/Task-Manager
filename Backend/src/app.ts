import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16KB" }));
app.use(cookieParser());

import userRoutes from "./routes/auth.router.js"
import workspaceRoutes from "./routes/workspace.router.js"

app.use('/api/v1/user' , userRoutes)
app.use('/api/v1/workspace' , workspaceRoutes)

export {app}    