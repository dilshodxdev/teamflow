import { useAuth } from "../contexts/AuthContext";
import { Task } from "../types";

export function usePermissions() {
  const { user } = useAuth();

  const isManager = user?.role === "manager";
  const isMember = user?.role === "member";
  const isPending = user?.role === "pending";

  return {
    user,
    isManager,
    isMember,
    isPending,

    // Projects
    canCreateProject: isManager,
    canEditProject: isManager,
    canDeleteProject: isManager,

    // Members
    canCreateMember: isManager,
    canEditMember: isManager,
    canDeleteMember: isManager,

    // Risks
    canCreateRisk: isManager,
    canEditRisk: isManager,
    canDeleteRisk: isManager,

    // Tasks
    canCreateTask: isManager || isMember,
    canDeleteTask: isManager,
    canAssignTaskToOthers: isManager,
    canEditTask: (task: Task): boolean => {
      if (isManager) return true;
      if (isMember) {
        // A member can only edit tasks assigned to themselves
        return Boolean(user?.memberId && task.assigneeId === user.memberId);
      }
      return false;
    },
  };
}
