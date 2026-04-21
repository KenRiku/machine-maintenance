import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function optionalSession(): Promise<SessionPayload | null> {
  return await getSession();
}
