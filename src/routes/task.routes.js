import express from "express";
import {
  createTask,
  getTasks,
  updateTask
} from "../controllers/task.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("ADMIN", "MANAGER"), createTask);
router.get("/", verifyToken, getTasks);
router.put("/:id", verifyToken, allowRoles("ADMIN", "MANAGER"), updateTask);
router.delete("/:id", verifyToken, allowRoles("ADMIN"), deleteTask);

export default router;