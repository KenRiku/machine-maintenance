import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDays } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: { machine: true, schedule: true },
  });
  if (!wo || wo.machine.orgId !== session.orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const status = body.status;
    const completionNotes = body.completionNotes
      ? String(body.completionNotes).trim()
      : undefined;
    const partsUsed = body.partsUsed ? String(body.partsUsed).trim() : undefined;

    if (status && !["OPEN", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (completionNotes !== undefined) updates.completionNotes = completionNotes;
    if (partsUsed !== undefined) updates.partsUsed = partsUsed;

    if (status === "COMPLETED") {
      if (!completionNotes) {
        return NextResponse.json(
          { error: "Completion notes required" },
          { status: 400 },
        );
      }
      updates.completedAt = new Date();
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: updates,
    });

    if (status === "COMPLETED") {
      // Create a permanent service log entry
      await prisma.serviceLog.create({
        data: {
          workOrderId: wo.id,
          machineId: wo.machineId,
          technicianId: session.userId,
          type: wo.type,
          notes: completionNotes!,
          partsUsed: partsUsed || null,
        },
      });

      // If PM, advance schedule next due date
      if (wo.scheduleId && wo.schedule) {
        const nextDueDate = addDays(
          new Date(),
          wo.schedule.intervalDays,
        );
        await prisma.maintenanceSchedule.update({
          where: { id: wo.schedule.id },
          data: { nextDueDate },
        });

        // Spawn the next PM work order
        await prisma.workOrder.create({
          data: {
            machineId: wo.machineId,
            scheduleId: wo.schedule.id,
            type: "PM",
            title: wo.schedule.title,
            description: wo.schedule.description,
            dueDate: nextDueDate,
            status: "OPEN",
          },
        });
      }

      // Reset machine status if no more open failure/repair work orders
      const remainingCritical = await prisma.workOrder.count({
        where: {
          machineId: wo.machineId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
          type: { in: ["FAILURE", "REPAIR"] },
        },
      });
      if (remainingCritical === 0) {
        await prisma.machine.update({
          where: { id: wo.machineId },
          data: { status: "OPERATIONAL" },
        });
      }
    } else if (status === "IN_PROGRESS") {
      await prisma.machine.update({
        where: { id: wo.machineId },
        data: {
          status:
            wo.type === "FAILURE"
              ? "DOWN"
              : wo.type === "REPAIR"
                ? "MAINTENANCE"
                : "MAINTENANCE",
        },
      });
    }

    return NextResponse.json({ workOrder: updated });
  } catch (err: any) {
    console.error("update work order error", err);
    return NextResponse.json(
      { error: err?.message || "Could not update" },
      { status: 500 },
    );
  }
}
