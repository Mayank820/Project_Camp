import { ProjectMember } from "../models/projectMember.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";

export const isProjectAdminOrAssignee = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  // If user is the assignee
  if (task.assignedTo.toString() === req.user._id.toString()) {
    return next();
  }

  // If user is a project admin
  const member = await ProjectMember.findOne({
    project: task.project,
    user: req.user._id,
    role: "project_admin",
  });

  if (member) return next();

  throw new ApiError(
    403,
    "Only assignee or project admin can perform this action",
  );
});
