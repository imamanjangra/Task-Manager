import Router from 'express';
import { workspaceStats } from '../controller/stats.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get("/workspace", authMiddleware ,  workspaceStats);

export default router;