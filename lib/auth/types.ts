import type { Role } from "./roles";

export type JwtPayload = {
  sub: number;
  userid: string;
  role: Role;
};

export type SessionUser = {
  id: number;
  userid: string;
  role: Role;
  email: string | null;
};

export type RegisterInput = {
  userid: string;
  password: string;
  email?: string | null;
};

export type LoginInput = {
  userid: string;
  password: string;
};

export type CreateUserInput = {
  userid: string;
  password: string;
  role: Role;
  email?: string | null;
};

export type UpdateUserInput = {
  role?: Role;
  locked?: boolean;
  failed_attempts?: number;
  email?: string | null;
};
