"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Schedule = {
  id: string;
  title: string;
  description: string;
  intervalDays: number;
  nextDueDate: string;
  status: string;
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

export default function MaintenanceTab({
  machineId,
  schedules,
  workOrders,
}: {
  machineId: string;
  schedules: Schedule[];
  workOrders: WorkOrder[];
}) {
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addingWorkOrder, setAddingWorkOrder] = useState(false);

  const openWorkOrders = workOrders.filter(
    (w) => w.status !== "COMPLETED",
  );

  return (
    <div className="space-y-6">
      <div className="panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="display-type text-lg text-ink-100">
              Preventive Maintenance Schedules
            </h3>
            <p className="mono text-[10px] text-ink-300 uppercase tracking-[0.2em] mt-0.5">
              {schedules.length} active · auto-generates work orders
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setAddingSchedule((v) => !v)}
          >
            {addingSchedule ? "Cancel" : "+ Add Schedule"}
          </button>
        </div>
        {addingSchedule && (
          <div className="px-5 py-5 border-b border-white/5 bg-ink-950/40">
            <NewScheduleForm
              machineId={machineId}
              onDone={() => setAddingSchedule(false)}
            />
          </div>
        )}
        {schedules.length === 0 ? (
          <div className="px-5 py-10 text-center text-ink-300 text-sm">
            No maintenance schedules yet. Add one above to start generating
            work orders on a cadence.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Interval</th>
                <th>Next Due</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="text-ink-100">{s.title}</td>
                  <td className="text-ink-300 text-sm">{s.description}</td>
                  <td className="mono text-xs text-ink-200">
                    {s.intervalDays}d
                  </td>
                  <td className="mono text-xs text-ink-200">
                    {new Date(s.nextDueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="display-type text-lg text-ink-100">
              Open Work Orders
            </h3>
            <p className="mono text-[10px] text-ink-300 uppercase tracking-[0.2em] mt-0.5">
              {openWorkOrders.length} open · {workOrders.length} total
            </p>
          </div>
          <button
            className="btn"
            onClick={() => setAddingWorkOrder((v) => !v)}
          >
            {addingWorkOrder ? "Cancel" : "+ Log repair / failure"}
          </button>
        </div>
        {addingWorkOrder && (
          <div className="px-5 py-5 border-b border-white/5 bg-ink-950/40">
            <NewWorkOrderForm
              machineId={machineId}
              onDone={() => setAddingWorkOrder(false)}
            />
          </div>
        )}
        {workOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-ink-300 text-sm">
            No work orders yet.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Work order</th>
                <th>Type</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((w) => (
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
                    <TypeBadge type={w.type} />
                  </td>
                  <td>
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="mono text-xs text-ink-200">
                    {w.dueDate
                      ? new Date(w.dueDate).toLocaleDateString()
                      : "—"}
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

function NewScheduleForm({
  machineId,
  onDone,
}: {
  machineId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intervalDays, setIntervalDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/machines/${machineId}/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, intervalDays }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid md:grid-cols-[1fr_2fr_auto] gap-3">
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quarterly bearing check"
          required
        />
      </div>
      <div>
        <label className="label">Description</label>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Inspect, lubricate, replace if worn"
          required
        />
      </div>
      <div>
        <label className="label">Interval (days)</label>
        <input
          type="number"
          min={1}
          className="input w-32"
          value={intervalDays}
          onChange={(e) => setIntervalDays(Number(e.target.value))}
          required
        />
      </div>
      {error && (
        <div className="md:col-span-3 text-sm text-signal-red">{error}</div>
      )}
      <div className="md:col-span-3 flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </form>
  );
}

function NewWorkOrderForm({
  machineId,
  onDone,
}: {
  machineId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"REPAIR" | "FAILURE">("REPAIR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/machines/${machineId}/work-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid md:grid-cols-[1fr_2fr_auto] gap-3">
      <div>
        <label className="label">Type</label>
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="REPAIR">Repair</option>
          <option value="FAILURE">Failure</option>
        </select>
      </div>
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Spindle making grinding noise"
          required
        />
      </div>
      <div className="self-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Logging…" : "Log"}
        </button>
      </div>
      <div className="md:col-span-3">
        <label className="label">Description</label>
        <textarea
          className="textarea"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you see, hear, or smell?"
        />
      </div>
      {error && <div className="text-sm text-signal-red">{error}</div>}
    </form>
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
