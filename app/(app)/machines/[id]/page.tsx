import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { machineCode, formatDate } from "@/lib/utils";
import MachineTabs from "./MachineTabs";

export const dynamic = "force-dynamic";

export default async function MachineDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const { tab } = await searchParams;

  const machine = await prisma.machine.findFirst({
    where: { id, orgId: session.orgId },
    include: {
      schedules: { orderBy: { nextDueDate: "asc" } },
      workOrders: { orderBy: { createdAt: "desc" } },
      serviceLogs: {
        orderBy: { createdAt: "desc" },
        include: { technician: true, workOrder: true },
      },
      chatMessages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!machine) notFound();

  const compatibleParts = await prisma.part.findMany({
    where: { compatibleTypes: { has: machine.type } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 rise">
      <div>
        <Link
          href="/machines"
          className="mono text-[11px] uppercase tracking-[0.25em] text-ink-300 hover:text-rust-400"
        >
          ← Back to registry
        </Link>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="mono text-[10px] tracking-[0.25em] uppercase text-rust-400 px-2 py-0.5 border border-rust-400/30">
              {machineCode(machine.id)}
            </span>
            <StatusChip status={machine.status} />
          </div>
          <h1 className="display-type text-4xl text-ink-100">{machine.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-300">
            <span>
              <span className="text-ink-400">Type</span>{" "}
              <span className="text-ink-200">{machine.type}</span>
            </span>
            <span>
              <span className="text-ink-400">Mfr</span>{" "}
              <span className="text-ink-200">{machine.manufacturer}</span>
            </span>
            <span>
              <span className="text-ink-400">Model</span>{" "}
              <span className="text-ink-200">{machine.model}</span>
            </span>
            <span className="mono text-xs">
              <span className="text-ink-400">SN</span>{" "}
              <span className="text-ink-200">{machine.serialNumber}</span>
            </span>
            <span>
              <span className="text-ink-400">Location</span>{" "}
              <span className="text-ink-200">{machine.location}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
            Enrolled
          </div>
          <div className="text-ink-100 text-sm mt-0.5">
            {formatDate(machine.createdAt)}
          </div>
        </div>
      </header>

      <MachineTabs
        machine={{
          id: machine.id,
          name: machine.name,
          type: machine.type,
          model: machine.model,
          manufacturer: machine.manufacturer,
          serialNumber: machine.serialNumber,
          location: machine.location,
          notes: machine.notes,
          status: machine.status,
          createdAt: machine.createdAt.toISOString(),
        }}
        schedules={machine.schedules.map((s) => ({
          ...s,
          nextDueDate: s.nextDueDate.toISOString(),
          createdAt: s.createdAt.toISOString(),
        }))}
        workOrders={machine.workOrders.map((w) => ({
          ...w,
          dueDate: w.dueDate?.toISOString() || null,
          createdAt: w.createdAt.toISOString(),
          completedAt: w.completedAt?.toISOString() || null,
        }))}
        serviceLogs={machine.serviceLogs.map((l) => ({
          id: l.id,
          type: l.type,
          notes: l.notes,
          partsUsed: l.partsUsed,
          createdAt: l.createdAt.toISOString(),
          technicianName: l.technician?.name || null,
          workOrderTitle: l.workOrder?.title || null,
        }))}
        chatMessages={machine.chatMessages.map((c) => ({
          id: c.id,
          role: c.role,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        }))}
        compatibleParts={compatibleParts}
        initialTab={tab || "overview"}
      />
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPERATIONAL: "chip-op",
    MAINTENANCE: "chip-warn",
    DOWN: "chip-down",
    OFFLINE: "chip-mute",
  };
  return <span className={map[status] || "chip-mute"}>{status}</span>;
}
