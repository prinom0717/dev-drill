import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "./jwt";
import type { SessionUser } from "./types";
import { isValidRole } from "./roles";
import { getUserByPayload } from "./session";

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

  return getUserByPayload(payload.sub);
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("認証が必要です");
  }
  return user;
}
