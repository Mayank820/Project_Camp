import { ProjectMember } from "../models/projectMember.models.js";

export const getUserProjectRole = async (userId, projectId) => {
  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });

  return membership.role || null;
};

export const isProjectAdmin = async (userId, projectId) => {
  const role = await getUserProjectRole(userId, projectId);
  return role === "project_admin";
};

export const isProjectAdminOrAssignee = async (
  userId,
  projectId,
  assignedToId,
) => {
  if (userId.toString() === assignedToId.toString()) return true;

  const role = await getUserProjectRole(userId, projectId);
  return role === "project_admin";
};
