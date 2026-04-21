import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, daysUntil, machineCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const status = params.status || "";

  const where: any = { machine: { orgId: session.orgId } };
  if (status) where.status = status;

  const workOrders = await prisma.workOrder.findMany({
    where,
    include: { machine: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const filters = [
    { label: "All", value: "" },
    { label: "Open", value: "OPEN" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
  ];

  const now = new Date();

  return (
    <div className="space-y-6 rise">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
            [ Work orders · {workOrders.length} ]
          </div>
          <h1 className="display-type text-4xl text-ink-100">Work Orders</h1>
          <p className="text-ink-300 mt-1 text-sm">
            Everything currently open, in progress, or recently closed.
          </p>
        </div>
        <Link href="/work-orders/new" className="btn-primary">
          + Create Work Order
        </Link>
      </header>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/work-orders?status=${f.value}` : "/work-orders"}
            className={`btn text-xs ${status === f.value ? "bg-rust-500 text-black border-rust-500" : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="panel overflow-x-auto">
        {workOrders.length === 0 ? (
          <div className="p-10 text-center text-ink-300 text-sm">
            Nothing here yet.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Work order</th>
                <th>Machine</th>
                <th>Type</th>
                <th>Status</th>
                <th>Due</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((w) => {
                const overdue = w.dueDate && w.status !== "COMPLETED" && w.dueDate < now;
                const days = w.dueDate ? daysUntil(w.dueDate) : null;
                return (
                  <tr key={w.id}>
                    <td>
                      <Link
                        href={`/work-orders/${w.id}`}
                        className="text-ink-100 hover:text-rust-400"
                      >
                        {w.title}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/machines/${w.machineId}`}
                        className="block"
                      >
                        <div className="text-ink-100 text-sm">
                          {w.machine.name}
                        </div>
                        <div className="mono text-[10px] text-ink-400">
                          {machineCode(w.machine.id)}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <TypeBadge type={w.type} />
                    </td>
                    <td>
                      <StatusBadge status={w.status} />
                    </td>
                    <td>
                      {w.dueDate ? (
                        <span
                          className={
                            overdue
                              ? "chip-down"
                              : days !== null && days < 7
                                ? "chip-warn"
                                : "chip-info"
                          }
                        >
                          {overdue
                            ? `${Math.abs(days!)}d over`
                            : w.status === "COMPLETED"
                              ? formatDate(w.dueDate)
                              : `in ${days}d`}
                        </span>
                      ) : (
                        <span className="text-ink-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="mono text-[10px] text-ink-300 uppercase tracking-[0.15em]">
                      {formatDate(w.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
