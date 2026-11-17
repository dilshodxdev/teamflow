export type ProjectStatus = "planned" | "in_progress" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: ProjectStatus;
  progress: number; // 0 - 100
}

export interface ProjectInputDTO {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
}

export type ProjectUpdateDTO = Partial<ProjectInputDTO>;
