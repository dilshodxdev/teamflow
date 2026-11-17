export interface Member {
  id: string;
  fullName: string;
  email: string;
  role: string; // Professional title e.g. "Project Manager", "Frontend Developer"
  accessRole: "manager" | "member";
}

export interface MemberInputDTO {
  fullName: string;
  email: string;
  role: string;
}

export type MemberUpdateDTO = Partial<MemberInputDTO>;
