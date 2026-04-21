import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDays } from "@/lib/utils";

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
    const intervalDays = Number(body.intervalDays);
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!description)
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    if (!Number.isFinite(intervalDays) || intervalDays < 1)
      return NextResponse.json({ error: "Interval must be a positive number" }, { status: 400 });

    const nextDueDate = addDays(new Date(), intervalDays);
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        machineId: id,
        title,
        description,
        intervalDays,
        nextDueDate,
      },
    });

    // Generate an initial work order from this schedule
    await prisma.workOrder.create({
      data: {
        machineId: id,
        scheduleId: schedule.id,
        type: "PM",
        title,
        description,
        dueDate: nextDueDate,
        status: "OPEN",
      },
    });

    return NextResponse.json({ schedule });
  } catch (err: any) {
    console.error("create schedule error", err);
    return NextResponse.json(
      { error: err?.message || "Could not save" },
      { status: 500 },
    );
  }
}
