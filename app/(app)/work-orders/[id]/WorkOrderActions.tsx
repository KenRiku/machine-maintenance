"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkOrderActions({
  workOrderId,
  currentStatus,
}: {
  workOrderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [notes, setNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function patch(payload: any) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/work-orders/${workOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setShowComplete(false);
    router.refresh();
  }

  async function complete(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Completion notes are required — they become the service log entry.");
      return;
    }
    await patch({
      status: "COMPLETED",
      completionNotes: notes,
      partsUsed: partsUsed || null,
    });
  }

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="display-type text-lg text-ink-100">Work actions</div>
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
          Status: {currentStatus.replace("_", " ")}
        </span>
      </div>

      {!showComplete ? (
        <div className="flex flex-wrap gap-2">
          {currentStatus === "OPEN" && (
            <button
              disabled={loading}
              onClick={() => patch({ status: "IN_PROGRESS" })}
              className="btn"
            >
              {loading ? "…" : "Start work"}
            </button>
          )}
          <button
            disabled={loading}
            onClick={() => setShowComplete(true)}
            className="btn-primary"
          >
            Complete work order
          </button>
        </div>
      ) : (
        <form onSubmit={complete} className="space-y-4">
          <div>
            <label className="label">Completion notes *</label>
            <textarea
              className="textarea"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you find, what did you do, any follow-up needed?"
              required
            />
          </div>
          <div>
            <label className="label">Parts used (optional)</label>
            <input
              className="input"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              placeholder="2x BRG-6203, 1x SEAL-19mm"
            />
          </div>
          {error && (
            <div className="text-sm text-signal-red border border-signal-red/30 bg-signal-red/5 px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowComplete(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Saving…" : "Mark complete"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
