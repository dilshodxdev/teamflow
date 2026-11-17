import { request } from "./api";
import { Project, ProjectInputDTO, ProjectUpdateDTO } from "../types";

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    return request<Project[]>("/api/projects");
  },

  async getProject(id: string): Promise<Project> {
    return request<Project>(`/api/projects/${id}`);
  },

  async createProject(data: ProjectInputDTO): Promise<Project> {
    return request<Project>("/api/projects", {
      method: "POST",
      data,
    });
  },

  async updateProject(id: string, data: ProjectUpdateDTO): Promise<Project> {
    return request<Project>(`/api/projects/${id}`, {
      method: "PATCH",
      data,
    });
  },

  async deleteProject(id: string): Promise<void> {
    return request<void>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },
};
