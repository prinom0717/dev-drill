import { SignJWT, jwtVerify } from "jose";

import type { JwtPayload } from "./types";
import type { Role } from "./roles";

const COOKIE_NAME = "auth_token";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

function getExpiresInSeconds(): number {
  const raw = process.env.JWT_EXPIRES_IN ?? "86400";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 86400;
}

export { COOKIE_NAME };

export async function signToken(payload: {
  userId: number;
  userid: string;
  role: Role;
}): Promise<string> {
  return new SignJWT({
    userid: payload.userid,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(`${getExpiresInSeconds()}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const userid = payload.userid;
    const role = payload.role;

    if (typeof sub !== "string" || typeof userid !== "string" || typeof role !== "string") {
      return null;
    }

    const userId = Number.parseInt(sub, 10);
    if (!Number.isFinite(userId)) {
      return null;
    }

    return {
      sub: userId,
      userid,
      role: role as Role,
    };
  } catch {
    return null;
  }
}
