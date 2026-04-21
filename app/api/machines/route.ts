import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const machines = await prisma.machine.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ machines });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const required = [
      "name",
      "type",
      "model",
      "manufacturer",
      "serialNumber",
      "location",
    ];
    for (const f of required) {
      if (!body[f] || typeof body[f] !== "string" || !body[f].trim()) {
        return NextResponse.json(
          { error: `${f} is required` },
          { status: 400 },
        );
      }
    }
    const machine = await prisma.machine.create({
      data: {
        orgId: session.orgId,
        name: body.name.trim(),
        type: body.type.trim(),
        model: body.model.trim(),
        manufacturer: body.manufacturer.trim(),
        serialNumber: body.serialNumber.trim(),
        location: body.location.trim(),
        notes: body.notes?.trim() || null,
        status: "OPERATIONAL",
      },
    });
    return NextResponse.json({ machine });
  } catch (err: any) {
    console.error("create machine error", err);
    return NextResponse.json(
      { error: err?.message || "Could not save" },
      { status: 500 },
    );
  }
}
