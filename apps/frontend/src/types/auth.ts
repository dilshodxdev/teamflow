export type UserRole = "manager" | "member" | "pending";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  memberId: string | null;
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
