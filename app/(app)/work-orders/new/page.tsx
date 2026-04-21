import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { machineCode } from "@/lib/utils";
import NewWorkOrderForm from "./NewWorkOrderForm";

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage() {
  const session = await requireSession();

  const machines = await prisma.machine.findMany({
    where: { orgId: session.orgId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true },
  });

  return (
    <div className="space-y-6 rise max-w-3xl">
      <div>
        <Link
          href="/work-orders"
          className="mono text-[11px] uppercase tracking-[0.25em] text-ink-300 hover:text-rust-400"
        >
          ← Back to work orders
        </Link>
      </div>

      <header className="pb-6 border-b border-white/5">
        <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
          [ New work order ]
        </div>
        <h1 className="display-type text-4xl text-ink-100">Create Work Order</h1>
        <p className="text-ink-300 mt-1 text-sm">
          Capture a repair, failure, or ad-hoc task against a specific machine.
        </p>
      </header>

      {machines.length === 0 ? (
        <div className="panel p-8 text-center space-y-3">
          <p className="text-ink-200">
            You need at least one enrolled machine before you can open a work order.
          </p>
          <Link href="/machines/new" className="btn-primary inline-block">
            Enroll a machine
          </Link>
        </div>
      ) : (
        <div className="panel p-6">
          <NewWorkOrderForm
            machines={machines.map((m) => ({
              id: m.id,
              label: `${m.name} · ${machineCode(m.id)} · ${m.location}`,
            }))}
          />
        </div>
      )}
    </div>
  );
}
