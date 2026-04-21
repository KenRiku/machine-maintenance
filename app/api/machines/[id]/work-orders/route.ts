import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const machine = await prisma.machine.findFirst({
    where: { id, orgId: session.orgId },
  });
  if (!machine)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const type = ["PM", "REPAIR", "FAILURE"].includes(body.type)
      ? body.type
      : "REPAIR";
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const wo = await prisma.workOrder.create({
      data: {
        machineId: id,
        type,
        title,
        description,
        status: type === "FAILURE" ? "IN_PROGRESS" : "OPEN",
      },
    });

    if (type === "FAILURE") {
      await prisma.machine.update({
        where: { id },
        data: { status: "DOWN" },
      });
    } else if (type === "REPAIR") {
      await prisma.machine.update({
        where: { id },
        data: { status: "MAINTENANCE" },
      });
    }

    return NextResponse.json({ workOrder: wo });
  } catch (err: any) {
    console.error("create work order error", err);
    return NextResponse.json(
      { error: err?.message || "Could not save" },
      { status: 500 },
    );
  }
}
