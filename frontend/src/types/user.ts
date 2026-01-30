export type Role = "USER" | "SUPPORT_AGENT" | "ADMIN";

export interface MeResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  active?: boolean;
  profilePictureUrl?: string;
}
