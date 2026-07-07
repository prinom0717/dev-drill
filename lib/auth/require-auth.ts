import { NextResponse } from "next/server";

import type { Role } from "./roles";
import { getSessionUser } from "./session";
import type { SessionUser } from "./types";

export async function requireAuth(request: Request): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }
  return user;
}

export async function requireRole(
  request: Request,
  roles: Role[],
): Promise<SessionUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) {
    return result;
  }

  if (!roles.includes(result.role)) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 403 });
  }

  return result;
}

export function isAuthError(value: SessionUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
