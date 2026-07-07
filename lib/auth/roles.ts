export const ROLES = ["admin", "editor", "user"] as const;

export type Role = (typeof ROLES)[number];

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function canEditQuestions(role: string): boolean {
  return role === "admin" || role === "editor";
}

export function canManageUsers(role: string): boolean {
  return role === "admin";
}

export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}
