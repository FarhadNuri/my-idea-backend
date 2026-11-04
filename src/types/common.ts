// Shared types used across multiple modules

export type RoleName = "USER" | "DOCTOR" | "ADMIN";

export interface JwtPayload {
  userId: string;
  role: RoleName;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

