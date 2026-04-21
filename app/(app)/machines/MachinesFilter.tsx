"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function MachinesFilter({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [pending, start] = useTransition();

  function apply(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams(params.toString());
    const nextQ = next.q ?? q;
    const nextStatus = next.status ?? status;
    if (nextQ) sp.set("q", nextQ);
    else sp.delete("q");
    if (nextStatus) sp.set("status", nextStatus);
    else sp.delete("status");
    const query = sp.toString();
    start(() => router.push(`/machines${query ? "?" + query : ""}`));
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-[220px] max-w-md">
        <input
          className="input"
          placeholder="Search name, model, serial, location…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply({});
          }}
          onBlur={() => apply({})}
        />
      </div>
      <select
        className="select w-auto"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          apply({ status: e.target.value });
        }}
      >
        <option value="">All statuses</option>
        <option value="OPERATIONAL">Operational</option>
        <option value="MAINTENANCE">Maintenance</option>
        <option value="DOWN">Down</option>
        <option value="OFFLINE">Offline</option>
      </select>
      {pending && (
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300 self-center">
          filtering…
        </span>
      )}
    </div>
  );
}
