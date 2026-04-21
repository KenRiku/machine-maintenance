"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MachineOption = { id: string; label: string };

export default function NewWorkOrderForm({
  machines,
}: {
  machines: MachineOption[];
}) {
  const router = useRouter();
  const [machineId, setMachineId] = useState(machines[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"REPAIR" | "PM" | "FAILURE">("REPAIR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!machineId) {
      setError("Select a machine.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/machines/${machineId}/work-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim(), type }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    router.push(`/work-orders/${data.workOrder.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label className="label" htmlFor="wo-machine">
          Machine *
        </label>
        <select
          id="wo-machine"
          className="select"
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
        >
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="wo-title">
          Title *
        </label>
        <input
          id="wo-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Replace worn bearing"
        />
      </div>

      <div>
        <label className="label" htmlFor="wo-description">
          Description
        </label>
        <textarea
          id="wo-description"
          className="textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's going on? What needs to happen?"
        />
      </div>

      <div>
        <label className="label" htmlFor="wo-type">
          Type
        </label>
        <select
          id="wo-type"
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        >
          <option value="REPAIR">Repair</option>
          <option value="PM">Preventive maintenance</option>
          <option value="FAILURE">Failure (machine down)</option>
        </select>
        <p className="mono text-[10px] text-ink-400 mt-1 uppercase tracking-[0.15em]">
          Failure flags the machine as DOWN; Repair sets MAINTENANCE.
        </p>
      </div>

      {error && (
        <div className="text-sm text-signal-red border border-signal-red/30 bg-signal-red/5 px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => router.push("/work-orders")}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Creating…" : "Create work order"}
        </button>
      </div>
    </form>
  );
}
