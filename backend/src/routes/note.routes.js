import { Router } from "express";
import {
  createNote,
  getNotesByTask,
  updateNote,
  deleteNote,
} from "../controllers/note.controllers.js";
import { verifyAccessToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes below require user to be authenticated
router.use(verifyAccessToken);

// Create a note
router.post("/", createNote); // POST /api/v1/note

// Get all notes for a specific task
router.get("/task/:taskId", getNotesByTask); // GET /api/v1/note/task/:taskId

// Update a note (only by creator)
router.put("/noteId", updateNote); // PUT /api/v1/note/:noteId

// Delete a note (only by creator)
router.delete("/:noteId", deleteNote); // DELETE /api/v1/note/:noteId

export default router;
