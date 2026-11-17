import { request } from "./api";
import { Task, TaskInputDTO, TaskUpdateDTO } from "../types";

export const tasksService = {
  async getTasks(projectId?: string): Promise<Task[]> {
    const query = projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
    return request<Task[]>(`/api/tasks${query}`);
  },

  async getTask(id: string): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`);
  },

  async createTask(data: TaskInputDTO): Promise<Task> {
    return request<Task>("/api/tasks", {
      method: "POST",
      data,
    });
  },

  async updateTask(id: string, data: TaskUpdateDTO): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      data,
    });
  },

  async deleteTask(id: string): Promise<void> {
    return request<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
