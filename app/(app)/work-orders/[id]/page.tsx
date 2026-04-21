import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, machineCode } from "@/lib/utils";
import WorkOrderActions from "./WorkOrderActions";

export const dynamic = "force-dynamic";

export default async function WorkOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      machine: true,
      schedule: true,
      serviceLogs: { include: { technician: true } },
      assignedTo: true,
    },
  });
  if (!wo || wo.machine.orgId !== session.orgId) notFound();

  return (
    <div className="space-y-6 rise max-w-4xl">
      <div>
        <Link
          href="/work-orders"
          className="mono text-[11px] uppercase tracking-[0.25em] text-ink-300 hover:text-rust-400"
        >
          ← Back to work orders
        </Link>
      </div>

      <header className="pb-6 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <TypeBadge type={wo.type} />
          <StatusBadge status={wo.status} />
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
            Created {formatDateTime(wo.createdAt)}
          </span>
        </div>
        <h1 className="display-type text-4xl text-ink-100 mb-3">{wo.title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Link
            href={`/machines/${wo.machineId}`}
            className="text-rust-400 hover:text-rust-300"
          >
            {wo.machine.name}{" "}
            <span className="mono text-xs text-ink-400 ml-1">
              {machineCode(wo.machine.id)}
            </span>
          </Link>
          {wo.schedule && (
            <span className="text-ink-300">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Schedule
              </span>{" "}
              {wo.schedule.title}
            </span>
          )}
          {wo.dueDate && (
            <span className="text-ink-300">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Due
              </span>{" "}
              {formatDateTime(wo.dueDate)}
            </span>
          )}
          {wo.completedAt && (
            <span className="text-signal-green">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Completed
              </span>{" "}
              {formatDateTime(wo.completedAt)}
            </span>
          )}
        </div>
      </header>

      {wo.description && (
        <div className="panel p-5">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-2">
            Description
          </div>
          <p className="text-ink-200 text-sm whitespace-pre-wrap leading-relaxed">
            {wo.description}
          </p>
        </div>
      )}

      {wo.status === "COMPLETED" ? (
        <div className="panel p-5">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-signal-green mb-2">
            Completion notes
          </div>
          <p className="text-ink-100 text-sm whitespace-pre-wrap leading-relaxed">
            {wo.completionNotes || "(no notes)"}
          </p>
          {wo.partsUsed && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-1">
                Parts used
              </div>
              <p className="text-ink-200 text-sm">{wo.partsUsed}</p>
            </div>
          )}
        </div>
      ) : (
        <WorkOrderActions
          workOrderId={wo.id}
          currentStatus={wo.status}
        />
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    PM: "chip-info",
    REPAIR: "chip-warn",
    FAILURE: "chip-down",
  };
  return <span className={map[type] || "chip-mute"}>{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "chip-info",
    IN_PROGRESS: "chip-warn",
    COMPLETED: "chip-op",
  };
  return (
    <span className={map[status] || "chip-mute"}>
      {status.replace("_", " ")}
    </span>
  );
}
