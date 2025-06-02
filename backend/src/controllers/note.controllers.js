import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { isProjectAdminOrAssignee } from "../utils/projectRoles.js";

// Utility to check if the user is a member of the project
const isProjectMember = async (userId, projectId) => {
  return await ProjectMember.findOne({ user: userId, project: projectId });
};

const createNote = asyncHandler(async (req, res) => {
  const { taskId, content } = req.body;

  if (!taskId || !content) {
    throw new ApiError(400, "Task ID and note content are required");
  }

  // Check if the task was created or not, because the note belongs to a particular task
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const isMember = await isProjectMember(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  const note = await ProjectNote.create({
    project: task.project,
    task: taskId,
    content,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { note }, "Note created successfully"));
});

const getNotesByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const isMember = await isProjectMember(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  const notes = await ProjectNote.find({ task: taskId }).populate(
    "createdBy",
    "username fullname",
  );

  return res.status(200).json(new ApiResponse(200, { notes }));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { updates } = req.body;

  const note = await ProjectNote.findById(noteId);
  if (!note) throw new ApiError(404, "Note not found");

  const task = await Task.findById(note.task);
  if (!task) throw new ApiError(404, "Task not found");

  const canEdit = await isProjectAdminOrAssignee(
    req.user._id,
    note.project,
    task.assignedTo,
  );
  if (!canEdit)
    throw new ApiError(
      403,
      "Only assignee or project admin can update this note",
    );

  Object.assign(note, updates);
  await note.save();

  return res.status(200).json(new ApiResponse(200, { note }, "Note updated"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await ProjectNote.findById(noteId);
  if (!note) throw new ApiError(404, "Note not found");

  const task = await Task.findById(note.task);
  if (!task) throw new ApiError(404, "Task not found");

  const canDelete = await isProjectAdminOrAssignee(
    req.user._id,
    note.project,
    task.assignedTo,
  );
  if (!canDelete)
    throw new ApiError(
      403,
      "Only assignee or project admin can delete this note",
    );

  await note.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Note deleted"));
});

export { createNote, getNotesByTask, updateNote, deleteNote };
