export type Role = "USER" | "SUPPORT_AGENT" | "ADMIN";

export interface MeResponse {
  id: number;
  email: string;
  role: Role;
}
