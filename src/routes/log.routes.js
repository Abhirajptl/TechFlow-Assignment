import express from "express";
import { getLogs } from "../controllers/log.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getLogs);

export default router;