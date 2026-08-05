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
import member from "./routes/member.router.js"
import board from "./routes/boards.routes.js"
import list from "./routes/list.controller.js"
import card from "./routes/card.router.js"
import card_member from "./routes/card_member.router.js"
app.use('/api/v1/user' , userRoutes)
app.use('/api/v1/workspace' , workspaceRoutes)
app.use('/api/v1/member' , member)
app.use("/api/v1/board" , board)
app.use("/api/v1/list" , list)
app.use("/api/v1/card" , card)
app.use("/api/v1/card" , card_member)

export {app}    