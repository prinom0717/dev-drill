export const ROLES = ["admin", "editor", "host", "user"] as const;

export type Role = (typeof ROLES)[number];

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function canEditQuestions(role: string): boolean {
  return role === "admin" || role === "editor";
}

export function canManageUsers(role: string): boolean {
  return role === "admin" || role === "host";
}

export function canViewAnalysis(role: string): boolean {
  return role === "host";
}

export function canAccessAdminPages(role: string): boolean {
  return role === "admin" || role === "editor" || role === "host";
}

export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}

// ロール階層の定義（数字が大きいほど上位）
const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  editor: 2,
  admin: 3,
  host: 4,
};

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function isHigherRole(role1: string, role2: string): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}

export function canManageUserByRole(managerRole: string, targetRole: string): boolean {
  return getRoleLevel(managerRole) >= getRoleLevel(targetRole);
}

export function getAssignableRoles(userRole: string): Role[] {
  const userLevel = getRoleLevel(userRole);
  return ROLES.filter(role => getRoleLevel(role) <= userLevel);
}
