import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { TaskStatusEnmu } from "../utils/constants.js";
import { User } from "../models/user.models.js";
import { sendMail, taskAssignmentContent } from "../utils/mail.js";
import fs from "fs";
import path from "path";

// Utility: - Check if the user is the memebr of the project
const isMemberOfProject = async (userId, projectId) => {
  return await ProjectMember.findOne({ user: userId, project: projectId });
};

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    project,
    assignedTo,
    dueDate,
    tags = [],
    status = TaskStatusEnmu.TODO,
  } = req.body;

  console.log("Body", req.body);
  console.log("Fields:", title, description, project, assignedTo);

  if (!title || !description || !project || !assignedTo) {
    throw new ApiError(
      400,
      "Title, description, project, and assignedTo are required",
    );
  }

  // // check project membership
  // const isMember = await isMemberOfProject(req.user._id, project);
  // if (!isMember)
  //   throw new ApiError(403, "You are not a member of this project");

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    tags,
    assignedBy: req.user._id,
    status,
    dueDate,
  });

  const assignee = await User.findById(assignedTo);

  if (assignee?.email) {
    const taskUrl = `${process.env.CLIENT_URL}/dashboard/tasks`;

    await sendMail({
      email: assignee.email,
      subject: `New Task Asssigned ${title}`,
      mailGenContent: taskAssignmentContent(assignee.username, title, taskUrl),
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

// get all task assigned to or created by the user
// const getUserTask = asyncHandler(async (req, res) => {
//   const task = await Task.find({
//     $or: [{ assignedTo: req.user._id }, { assignedBy: req.user._id }],
//   }).populate("project assignedTo assignedBy", "name username fullname");
// });

const getUserTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, assignedTo, tag, search } = req.query;

  const filter = {
    $or: [{ assignedTo: req.user._id }, { assignedBy: req.user._id }],
  };

  // Add filters if provided
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (tag) filter.tags = tag; // assumes tags is an array
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .populate("project assignedTo assignedBy", "name username fullname");

  const total = await Task.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

// Get all task of the specific project
// const getTaskByProject = asyncHandler(async (req, res) => {
//   const { projectId } = req.params;

//   // check project membership
//   const isMember = await isMemberOfProject(req.user._id, projectId);
//   if (!isMember)
//     throw new ApiError(403, "You are not a member of this project");

//   const tasks = await Task.find({ project: projectId }).populate(
//     "assignedTo assignedBy",
//     "username fullname",
//   );

//   return res.status(200).json(new ApiResponse(200, { tasks }));
// });

const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const isMember = await isMemberOfProject(req.user._id, projectId);
  if (!isMember) throw new ApiError(403, "Not a member of this project");

  const filter = { project: projectId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

// Update task
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { updates, dueDate } = req.body;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  // Reset reminderSent if dueDate or status is changing
  // why toLocaleString()? It is because task.dueDate is Date object and updates.dueDate comes as string. To ensure correct comparison we use toLocaleString().
  if (
    (updates.dueDate && updates.dueDate !== task.dueDate?.toLocaleString()) ||
    (updates.status && updates.status !== task.status)
  ) {
    task.reminderSent = false;
  }

  console.log("Resetting reminderSent:", task.reminderSent);

  //   Object.assign() is a method used to copy properties from or more sources object to target object. It returns the modified target object
  Object.assign(task, updates);
  await task.save();

  return res.status(200).json(new ApiResponse(200, { task }, "Task updated"));
});

// Delete task
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, " Task not found");

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember)
    throw new ApiError(403, "You are not a member of this project");

  await task.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const uploadTaskFiles = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember) throw new ApiError(403, "Not allowed");

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  const uploadMetaData = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
    originalname: file.originalname, // optional, for user display
  }));

  task.attachments.push(...uploadMetaData);
  await task.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { attachments: task.attachments },
        "Files uploaded successfully",
      ),
    );
});

const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { url } = req.body; //  expecting `/uploads/filename.ext`

  console.log("Trying to delete:", url);
  if (!url) throw new ApiError(400, "Attachment URL is required");

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  console.log("Current attachments:", task.attachments);

  const isMember = await isMemberOfProject(req.user._id, task.project);
  if (!isMember) throw new ApiError(403, "You're not allowed to delete file");

  // Now remove that file from DB
  const originalLength = task.attachments.length;
  task.attachments = task.attachments.filter(
    (att) => att.url.toLowerCase() !== url.toLowerCase(),
  );

  if (task.attachments.length === originalLength) {
    throw new ApiError(404, "Attachment not found");
  }

  await task.save();

  // Remove from file system
  const fullPath = path.join(process.cwd(), "public", url); // remove `/uploads/`
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  return res.status(200).json(new ApiResponse(200, {}, "Attachment deleted"));
});

export {
  createTask,
  getUserTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  uploadTaskFiles,
  deleteTaskAttachment,
};
