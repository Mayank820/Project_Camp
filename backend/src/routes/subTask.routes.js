import { Router } from "express";
import {
  createSubTask,
  getSubtTaskByTask,
  toggleSubTaskStatus,
  deleteSubTask,
} from "../controllers/subTask.controllers.js";
import { verifyAccessToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// All subtask routes require authentication
router.use(verifyAccessToken);

// Create subtask
router.post("/", createSubTask); // POST /api/v1/subtask

// Get subTask for a task
router.get("/task/:taskId", getSubtTaskByTask); // GET /api/v1/subtask/task/:taskId

// Update the status of subtask
router.patch("/:subtaskId/toggle", toggleSubTaskStatus); // PATCH /api/v1/subtask/:subtaskId/toggle

// Delete subtask
router.delete("/:subtaskId", deleteSubTask); // DELETE /api/v1/subtask/:subtaskId

export default router;
