import { request } from "./api";
import { Member, MemberInputDTO, MemberUpdateDTO } from "../types";

export const membersService = {
  async getMembers(): Promise<Member[]> {
    return request<Member[]>("/api/members");
  },

  async createMember(data: MemberInputDTO): Promise<Member> {
    return request<Member>("/api/members", {
      method: "POST",
      data,
    });
  },

  async updateMember(id: string, data: MemberUpdateDTO): Promise<Member> {
    return request<Member>(`/api/members/${id}`, {
      method: "PATCH",
      data,
    });
  },

  async deleteMember(id: string): Promise<void> {
    return request<void>(`/api/members/${id}`, {
      method: "DELETE",
    });
  },
};
