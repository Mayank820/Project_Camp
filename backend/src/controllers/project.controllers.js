import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { User } from "../models/user.models.js";
import { UserRoleEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  console.log("Body", req.body);

  const { name, description } = req.body;

  const existingProject = await Project.findOne({ name });
  if (existingProject) throw new ApiError(409, "Project name already taken");

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id, // indicates which user has created the project
  });

  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: UserRoleEnum.PROJECT_ADMIN,
  });

  // await project.save()
  console.log("✅ Project saved:", project);
  return res
    .status(200)
    .json(new ApiResponse(201, { project }, "Project created successfully"));
});

const getProjects = asyncHandler(async (req, res) => {
  // finding the project member entrires
  const memberships = await ProjectMember.find({ user: req.user._id }).populate(
    "project",
  );

  // populate the project to get full project details
  const projects = memberships.map((membership) => membership.project);

  return res.status(200).json(new ApiResponse(200, { projects }));
});

const getProjectsById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  console.log("PARAM projectId:", projectId);

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const memberships = await ProjectMember.findOne({
    user: req.user._id,
    project: projectId,
  });

  return res.status(200).json(new ApiResponse(200, { project }));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only project creator can update
  if (!project.createdBy.equals(req.user._id)) {
    throw new ApiError(403, "Only creator/admin can update the project");
  }

  if (name) project.name = name;
  if (description) project.description = description;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project updated"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only project creator can delete
  if (!project.createdBy.equals(req.user._id)) {
    throw new ApiError(403, "Only creator/admin can delete the project");
  }

  await ProjectMember.deleteMany({ project: projectId });
  await Project.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

// const addMemberToProject = asyncHandler(async (req, res) => {
//   const { projectId } = req.params;
//   const { userId, role } = req.body;

//   const project = await Project.findById(projectId);
//   if (!project) throw new ApiError(404, "Project not found");

//   const adminMember = await ProjectMember.findOne({
//     project: projectId,
//     user: req.user._id,
//     role: UserRoleEnum.PROJECT_ADMIN,
//   });

//   if (!adminMember) {
//     throw new ApiError(403, "Only project admins can add members");
//   }

//   const existingMember = ProjectMember.findOne({
//     project: projectId,
//     user: userId,
//   });

//   if (existingMember) throw new ApiError(409, "User already in project");

//   const newMember = ProjectMember.create({
//     project: projectId,
//     user: userId,
//     role,
//   });

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(201, { member: newMember }, "Member added successfully"),
//     );
// });

const addMemberToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // ✅ Check if requester is a project admin
  const adminMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
    role: UserRoleEnum.PROJECT_ADMIN,
  });

  if (!adminMember) {
    throw new ApiError(403, "Only project admins can add members");
  }

  // ✅ Correct user and added await
  const existingMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (existingMember) throw new ApiError(409, "User already in project");

  const newMember = await ProjectMember.create({
    project: projectId,
    user: userId,
    role,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { member: newMember }, "Member added successfully"),
    );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const member = await ProjectMember.find({ project: projectId }).populate(
    "user",
    "username email fullname",
  );

  return res.status(200).json(new ApiResponse(200, { member }));
});

const updateProjectMembers = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const adminMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
    role: UserRoleEnum.PROJECT_ADMIN,
  });

  if (!adminMember) {
    throw new ApiError(403, "Only project admins can update roles");
  }

  const member = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (!member) throw new ApiError(404, "Member not found");

  member.role = role;
  await member.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { member }, "Member role updated"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const adminMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
    role: UserRoleEnum.PROJECT_ADMIN,
  });

  if (!adminMember) {
    throw new ApiError(403, "Only project admins can update roles");
  }

  const member = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (!member) throw new ApiError(404, "Member not found");

  member.role = role;
  await member.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { member }, "Member role updated"));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const adminMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id,
    role: UserRoleEnum.PROJECT_ADMIN,
  });

  if (!adminMember) {
    throw new ApiError(403, "Only project admins can remove members");
  }

  const member = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (!member) throw new ApiError(404, "Member not found");

  await member.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});

export {
  getProjects,
  getProjectsById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateProjectMembers,
  updateMemberRole,
  deleteMember,
};
