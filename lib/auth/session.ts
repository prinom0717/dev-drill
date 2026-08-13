import { prisma } from "@/lib/prisma";

import { getTokenFromCookie } from "./cookies";
import { verifyToken } from "./jwt";
import type { SessionUser } from "./types";
import { isValidRole } from "./roles";

export async function getUserByPayload(sub: number): Promise<SessionUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: sub,
      deleted: false,
      locked: false,
    },
    select: {
      id: true,
      userid: true,
      role: true,
      email: true,
    },
  });

  if (!user || !isValidRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    userid: user.userid,
    role: user.role,
    email: user.email,
  };
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = getTokenFromCookie(request);
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return getUserByPayload(payload.sub);
}

export async function getSessionUserFromToken(token: string): Promise<SessionUser | null> {
  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return getUserByPayload(payload.sub);
}
