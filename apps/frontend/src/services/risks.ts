import { request } from "./api";
import { Risk, RiskInputDTO, RiskUpdateDTO } from "../types";

export const risksService = {
  async getRisks(projectId?: string): Promise<Risk[]> {
    const query = projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
    return request<Risk[]>(`/api/risks${query}`);
  },

  async createRisk(data: RiskInputDTO): Promise<Risk> {
    return request<Risk>("/api/risks", {
      method: "POST",
      data,
    });
  },

  async updateRisk(id: string, data: RiskUpdateDTO): Promise<Risk> {
    return request<Risk>(`/api/risks/${id}`, {
      method: "PATCH",
      data,
    });
  },

  async deleteRisk(id: string): Promise<void> {
    return request<void>(`/api/risks/${id}`, {
      method: "DELETE",
    });
  },
};
