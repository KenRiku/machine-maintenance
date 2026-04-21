import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { orgName, name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }
    const facility = orgName?.trim() || `${name.trim()}'s Facility`;
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    const normalized = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const org = await prisma.organization.create({
      data: { name: facility },
    });
    const user = await prisma.user.create({
      data: {
        email: normalized,
        name,
        passwordHash,
        orgId: org.id,
        role: "MANAGER",
      },
    });

    const token = await signSession({
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("signup error", err);
    return NextResponse.json(
      { error: err?.message || "Signup failed" },
      { status: 500 },
    );
  }
}
