// if we want the key then we use UserRoleEnum
export const UserRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};
// if we want the whole array then we can use AvailableUserRoles
// so we have to export both values
export const AvailableUserRoles = Object.values(UserRoleEnum);

export const TaskStatusEnmu = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnmu);
