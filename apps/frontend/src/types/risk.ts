export type RiskStatus = "active" | "monitoring" | "resolved";
export type RiskLevel = "low" | "medium" | "high";

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
  assigneeId: string | null;
  status: RiskStatus;
  score: number; // probability * impact (backend computed)
  level: RiskLevel; // low (1-5), medium (6-12), high (13-25) (backend computed)
}

export interface RiskInputDTO {
  projectId: string;
  title: string;
  probability: number;
  impact: number;
  mitigation: string;
  assigneeId: string | null;
  status: RiskStatus;
}

export type RiskUpdateDTO = Partial<RiskInputDTO>;
