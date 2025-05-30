import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectsById,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateMemberRole,
  deleteMember,
} from "../controllers/project.controllers.js";

import { verifyAccessToken } from "../middlewares/auth.middlewares.js";

const router = Router();

// All routes require authentication
/**
 * What verifyAccessToken Does
 * This middleware: -
 *      1. Extracts the Authorization: Bearer <token> header.
 *      2. Verifies it using your JWT secret (ACCESS_TOKEN_SECRET)
 *      3. Decodes the user’s _id from the token
 *      4. Loads the user from the database
 *      5. Attaches the user to req.user
 */
router.use(verifyAccessToken);

// Debug log to verify route hit
router.post(
  "/",
  (req, res, next) => {
    console.log("🔥 POST /api/v1/project hit");
    console.log("📦 BODY RECEIVED:", req.body);
    next();
  },
  createProject,
);

// Project CRUD
router.get("/", getProjects);
router.get("/:projectId", getProjectsById);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// Member management
router.post("/:projectId/members", addMemberToProject);
router.get("/:projectId/members", getProjectMembers);
router.put("/:projectId/members/:userId", updateMemberRole);
router.delete("/:projectId/members/:userId", deleteMember);

export default router;
