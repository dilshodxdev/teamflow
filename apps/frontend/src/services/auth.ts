import { request } from "./api";
import { AuthUser, LoginDTO, RegisterDTO } from "../types";

export const authService = {
  async register(data: RegisterDTO): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      data,
    });
  },

  async login(data: LoginDTO): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/login", {
      method: "POST",
      data,
    });
  },

  async me(): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/me", {
      method: "GET",
    });
  },

  async logout(): Promise<void> {
    return request<void>("/api/auth/logout", {
      method: "POST",
      data: {},
    });
  },
};
