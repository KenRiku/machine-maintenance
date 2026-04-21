"use client";

import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

type Log = {
  id: string;
  type: string;
  notes: string;
  partsUsed: string | null;
  createdAt: string;
  technicianName: string | null;
  workOrderTitle: string | null;
};

type WorkOrder = {
  id: string;
  title: string;
  type: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
};

export default function HistoryTab({
  serviceLogs,
  workOrders,
}: {
  serviceLogs: Log[];
  workOrders: WorkOrder[];
}) {
  const events: Array<{
    kind: "log" | "wo";
    date: string;
    node: React.ReactNode;
    id: string;
  }> = [];

  for (const log of serviceLogs) {
    events.push({
      kind: "log",
      date: log.createdAt,
      id: log.id,
      node: (
        <LogRow
          log={log}
          key={log.id}
        />
      ),
    });
  }

  // Show non-completed work orders as "open" events
  for (const wo of workOrders) {
    if (wo.status === "COMPLETED" && wo.completedAt) {
      // Completed work orders should already have a service log; skip to avoid duplicates
      continue;
    }
    events.push({
      kind: "wo",
      date: wo.createdAt,
      id: wo.id,
      node: <WorkOrderRow wo={wo} key={wo.id} />,
    });
  }

  events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (events.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <div className="display-type text-lg text-ink-100 mb-1">
          No service history yet
        </div>
        <p className="text-ink-400 text-sm max-w-md mx-auto">
          Complete a work order or log a repair — it will appear here as a
          permanent entry in the machine's service ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="display-type text-lg text-ink-100">Service Ledger</h3>
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
          {events.length} entries
        </span>
      </div>
      <ol className="relative">
        {events.map((e) => (
          <li key={e.kind + e.id} className="px-5 py-4 border-b border-white/5 last:border-0 relative">
            {e.node}
          </li>
        ))}
      </ol>
    </div>
  );
}

function LogRow({ log }: { log: Log }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <TypeDot type={log.type} />
        <div className="w-px flex-1 bg-white/5 mt-1" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TypeBadge type={log.type} />
            {log.workOrderTitle && (
              <span className="text-ink-100 text-sm">
                {log.workOrderTitle}
              </span>
            )}
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {formatDateTime(log.createdAt)}
          </span>
        </div>
        <p className="text-sm text-ink-200 whitespace-pre-wrap">
          {log.notes}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-ink-400">
          {log.technicianName && (
            <span>
              <span className="mono text-[10px] uppercase tracking-[0.15em]">
                Tech
              </span>{" "}
              {log.technicianName}
            </span>
          )}
          {log.partsUsed && (
            <span>
              <span className="mono text-[10px] uppercase tracking-[0.15em]">
                Parts
              </span>{" "}
              {log.partsUsed}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkOrderRow({ wo }: { wo: WorkOrder }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <TypeDot type={wo.type} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TypeBadge type={wo.type} />
            <Link
              href={`/work-orders/${wo.id}`}
              className="text-ink-100 hover:text-rust-400 text-sm"
            >
              {wo.title}
            </Link>
          </div>
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {formatDateTime(wo.createdAt)}
          </span>
        </div>
        <div className="text-xs text-ink-400 mono uppercase tracking-[0.15em]">
          {wo.status.replace("_", " ")} · open work order
        </div>
      </div>
    </div>
  );
}

function TypeDot({ type }: { type: string }) {
  const color =
    type === "FAILURE"
      ? "bg-signal-red"
      : type === "REPAIR"
        ? "bg-signal-amber"
        : type === "PM"
          ? "bg-signal-blue"
          : "bg-ink-400";
  return (
    <div className={`w-2 h-2 rounded-full ${color} ring-4 ring-ink-900`} />
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    PM: "chip-info",
    REPAIR: "chip-warn",
    FAILURE: "chip-down",
    NOTE: "chip-mute",
  };
  return <span className={map[type] || "chip-mute"}>{type}</span>;
}
