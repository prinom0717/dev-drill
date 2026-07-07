import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "./jwt";
import type { SessionUser } from "./types";
import { isValidRole } from "./roles";

const COOKIE_NAME = "auth_token";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.sub,
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

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("認証が必要です");
  }
  return user;
}
