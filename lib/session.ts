import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "mechtrak_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  orgId: string;
  email: string;
  name: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
