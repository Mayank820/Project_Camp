import { Router } from "express";
import {
  createTask,
  getUserTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  uploadTaskFiles,
  deleteTaskAttachment,
} from "../controllers/task.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyAccessToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// ✅ All routes below require authentication
router.use(verifyAccessToken);

// Create a task
router.post("/", createTask); // POST /api/v1/task

// Get tasks for the logged-in user
router.get("/", getUserTasks); // GET /api/v1/task

// Get all tasks under a specific project
router.get("/project/:projectId", getTasksByProject); // GET /api/v1/task/project/:projectId

// Update task
router.put("/:taskId", updateTask); // PUT /api/v1/task/:taskId

// Delete a task
router.delete("/:taskId", deleteTask); // DELETE /api/v1/task/:taskId

// upload a file
router.post(
  "/:taskId/upload",
  verifyAccessToken,
  upload.array("files", 5), // up to 5 files
  uploadTaskFiles,
); // POST /api/v1/task/{taskId}/upload

// delete file
router.delete("/:taskId/attachment", verifyAccessToken, deleteTaskAttachment); // DELETE /api/v1/task/:taskId/attachment

export default router;
