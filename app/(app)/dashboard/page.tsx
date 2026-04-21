import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, daysUntil, machineCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await requireSession();
  const orgId = session.orgId;

  const [totalMachines, openWOs, completedThisMonth, upcomingWorkOrders, recentLogs] =
    await Promise.all([
      prisma.machine.count({ where: { orgId } }),
      prisma.workOrder.count({
        where: { machine: { orgId }, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.workOrder.count({
        where: {
          machine: { orgId },
          status: "COMPLETED",
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.workOrder.findMany({
        where: {
          machine: { orgId },
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        include: { machine: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.serviceLog.findMany({
        where: { machine: { orgId } },
        include: { machine: true, technician: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const now = new Date();
  const overdueCount = upcomingWorkOrders.filter(
    (wo) => wo.dueDate && wo.dueDate < now,
  ).length;

  return (
    <div className="space-y-8 rise">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
            [ Dashboard ]
          </div>
          <h1 className="display-type text-4xl text-ink-100">
            Floor overview
          </h1>
          <p className="text-ink-300 mt-1 text-sm">
            Pulse check across every machine, PM, and repair on your floor.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/machines/new" className="btn-primary">
            + Enroll machine
          </Link>
          <Link href="/machines" className="btn">
            View fleet
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
        <Kpi label="Total Machines" value={totalMachines} code="MX-ALL" />
        <Kpi
          label="Overdue"
          value={overdueCount}
          code="MX-RED"
          tone={overdueCount > 0 ? "red" : "mute"}
        />
        <Kpi
          label="Open Work Orders"
          value={openWOs}
          code="WO-OPN"
          tone={openWOs > 0 ? "warn" : "mute"}
        />
        <Kpi
          label="Completed This Month"
          value={completedThisMonth}
          code="WO-DONE"
          tone="green"
        />
      </div>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="panel">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="display-type text-lg text-ink-100">
              Upcoming Maintenance
            </h2>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
              Next 10 · sorted by due
            </span>
          </div>
          {upcomingWorkOrders.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              body="Add a machine and create a maintenance schedule to generate work orders."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Work order</th>
                  <th>Type</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingWorkOrders.map((wo) => {
                  const overdue = wo.dueDate && wo.dueDate < now;
                  const days = wo.dueDate
                    ? daysUntil(wo.dueDate)
                    : null;
                  return (
                    <tr key={wo.id}>
                      <td>
                        <Link
                          href={`/machines/${wo.machineId}`}
                          className="block"
                        >
                          <div className="text-ink-100">{wo.machine.name}</div>
                          <div className="mono text-[10px] text-ink-400">
                            {machineCode(wo.machine.id)}
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/work-orders/${wo.id}`}
                          className="text-ink-100 hover:text-rust-400"
                        >
                          {wo.title}
                        </Link>
                      </td>
                      <td>
                        <TypeBadge type={wo.type} />
                      </td>
                      <td>
                        <span
                          className={
                            overdue
                              ? "chip-down"
                              : days !== null && days < 7
                                ? "chip-warn"
                                : "chip-info"
                          }
                        >
                          {wo.dueDate
                            ? overdue
                              ? `${Math.abs(days!)}d over`
                              : `in ${days}d`
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={wo.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="display-type text-lg text-ink-100">
              Recent Activity
            </h2>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
              Log · last 8
            </span>
          </div>
          {recentLogs.length === 0 ? (
            <EmptyState
              title="No service activity yet"
              body="Completed work orders will appear here as a permanent service log."
            />
          ) : (
            <ol className="divide-y divide-white/5">
              {recentLogs.map((log) => (
                <li key={log.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/machines/${log.machineId}`}
                      className="text-ink-100 text-sm hover:text-rust-400"
                    >
                      {log.machine.name}
                    </Link>
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={log.type} />
                    {log.technician && (
                      <span className="mono text-[10px] text-ink-300 uppercase tracking-[0.15em]">
                        · {log.technician.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink-300 line-clamp-2">
                    {log.notes}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  code,
  tone = "mute",
}: {
  label: string;
  value: number;
  code: string;
  tone?: "mute" | "green" | "warn" | "red";
}) {
  const toneColor =
    tone === "green"
      ? "text-signal-green"
      : tone === "warn"
        ? "text-signal-amber"
        : tone === "red"
          ? "text-signal-red"
          : "text-ink-100";
  return (
    <div className="kpi">
      <div className="flex items-center justify-between mb-4">
        <span className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300">
          {label}
        </span>
        <span className="mono text-[9px] text-ink-400 tracking-[0.2em]">
          {code}
        </span>
      </div>
      <div className={`display-type text-5xl ${toneColor}`}>{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-10 text-center">
      <div className="display-type text-base text-ink-100">{title}</div>
      <p className="text-ink-400 text-sm mt-1">{body}</p>
    </div>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "chip-info",
    IN_PROGRESS: "chip-warn",
    COMPLETED: "chip-op",
  };
  return <span className={map[status] || "chip-mute"}>{status.replace("_", " ")}</span>;
}
