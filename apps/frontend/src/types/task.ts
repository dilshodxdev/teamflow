export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
}

export interface TaskInputDTO {
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export type TaskUpdateDTO = Partial<TaskInputDTO>;
