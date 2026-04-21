import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { machineCode, formatDate } from "@/lib/utils";
import MachinesFilter from "./MachinesFilter";

export const dynamic = "force-dynamic";

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const statusFilter = params.status?.trim() || "";

  const machines = await prisma.machine.findMany({
    where: {
      orgId: session.orgId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { model: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { manufacturer: { contains: q, mode: "insensitive" } },
              { type: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { workOrders: true, schedules: true } },
    },
  });

  return (
    <div className="space-y-6 rise">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
            [ Registry · {machines.length} ]
          </div>
          <h1 className="display-type text-4xl text-ink-100">Machines</h1>
          <p className="text-ink-300 mt-1 text-sm">
            Every asset, QR-tagged, searchable, and service-logged.
          </p>
        </div>
        <Link href="/machines/new" className="btn-primary">
          + Add Machine
        </Link>
      </header>

      <MachinesFilter initialQ={q} initialStatus={statusFilter} />

      <div className="panel overflow-x-auto">
        {machines.length === 0 ? (
          <div className="p-12 text-center">
            <div className="display-type text-lg text-ink-100 mb-1">
              No machines yet
            </div>
            <p className="text-ink-400 text-sm max-w-md mx-auto mb-6">
              Start by enrolling the first machine on your floor. Every asset
              gets a QR code and a permanent service ledger.
            </p>
            <Link href="/machines/new" className="btn-primary">
              + Add your first machine
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Machine</th>
                <th>Type</th>
                <th>Manufacturer / Model</th>
                <th>Location</th>
                <th>Status</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id} className="cursor-pointer">
                  <td>
                    <Link
                      href={`/machines/${m.id}`}
                      className="mono text-xs text-rust-400"
                    >
                      {machineCode(m.id)}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/machines/${m.id}`} className="block">
                      <div className="text-ink-100">{m.name}</div>
                      <div className="mono text-[10px] text-ink-400">
                        SN {m.serialNumber}
                      </div>
                    </Link>
                  </td>
                  <td className="text-ink-200 text-sm uppercase tracking-[0.15em] mono text-xs">
                    {m.type}
                  </td>
                  <td>
                    <div className="text-ink-100 text-sm">
                      {m.manufacturer}
                    </div>
                    <div className="mono text-[10px] text-ink-400">
                      {m.model}
                    </div>
                  </td>
                  <td className="text-ink-200 text-sm">{m.location}</td>
                  <td>
                    <StatusChip status={m.status} />
                  </td>
                  <td className="mono text-[10px] text-ink-300 uppercase tracking-[0.15em]">
                    {formatDate(m.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
