import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subTask.models.js";

// Utility to check membership
const isMemberOfProject = async (userId, projectId) => {
  return await ProjectMember.findOne({ user: userId, project: projectId });
};

// Create a subTask under a parent task
const createSubTask = asyncHandler(async (req, res) => {
  const { taskId, title } = req.body;

  if (!taskId || !title)
    throw new ApiError(400, "Task ID and title are required");

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Parent task not found");

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  const subtask = await SubTask.create({ task: taskId, title });

  return res
    .status(201)
    .json(new ApiResponse(201, { subtask }, "Subtask created"));
});

// Get all the subTask for a Task
const getSubtTaskByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  const subtask = await SubTask.find({ task: taskId });

  return res.status(200).json(new ApiResponse(200, { subtask }));
});

// Update task completion status
const toggleSubTaskStatus = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;

  const subtask = await SubTask.findById(subtaskId).populate("task");
  if (!subtask) throw new ApiError(404, "Subtask not found");

  const isMember = await isMemberOfProject(req.user._id, subtask.task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  subtask.isCompleted = !subtask.isCompleted;
  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { subtask }, "Subtask status updated"));
});

// Delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;

  const subtask = await SubTask.findById(subtaskId).populate("task");
  if (!subtask) throw new ApiError(404, "Subtask not found");

  const isMember = await isMemberOfProject(req.user._id, subtask.task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  await subtask.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Subtask deleted"));
});

export { createSubTask, getSubtTaskByTask, toggleSubTaskStatus, deleteSubTask };
