import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    const normalized = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signSession({
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("login error", err);
    return NextResponse.json(
      { error: err?.message || "Login failed" },
      { status: 500 },
    );
  }
}
