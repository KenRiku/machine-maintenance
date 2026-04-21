"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  notes: string;
};

const DEFAULTS: Fields = {
  name: "",
  type: "",
  model: "",
  manufacturer: "",
  serialNumber: "",
  location: "",
  notes: "",
};

const REQUIRED: Array<keyof Fields> = [
  "name",
  "type",
  "model",
  "manufacturer",
  "serialNumber",
  "location",
];

const TYPES = [
  "CNC",
  "Lathe",
  "Mill",
  "Press",
  "Conveyor",
  "Pump",
  "Compressor",
  "Boiler",
  "HVAC",
  "Robot",
  "Packaging",
  "Other",
];

export default function NewMachineForm() {
  const router = useRouter();
  const [f, setF] = useState<Fields>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Fields>(k: K, v: string) {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const key of REQUIRED) {
      if (!f[key].trim()) next[key] = `${labelFor(key)} is required`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    const res = await fetch("/api/machines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setServerError(data.error || "Could not save");
      return;
    }
    router.push(`/machines/${data.machine.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid md:grid-cols-2 gap-5">
        <Field
          label="Machine name"
          hint="e.g. Lathe #3, Injector-A"
          error={errors.name}
        >
          <input
            className="input"
            value={f.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>

        <Field label="Type" hint="Category" error={errors.type}>
          <select
            className="select"
            value={f.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">Select type…</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Make" error={errors.manufacturer}>
          <input
            className="input"
            value={f.manufacturer}
            onChange={(e) => update("manufacturer", e.target.value)}
            placeholder="e.g. Haas, Siemens"
          />
        </Field>

        <Field label="Model" error={errors.model}>
          <input
            className="input"
            value={f.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="e.g. L-3000"
          />
        </Field>

        <Field label="Serial number" error={errors.serialNumber}>
          <input
            className="input mono"
            value={f.serialNumber}
            onChange={(e) => update("serialNumber", e.target.value)}
            placeholder="SN-…"
          />
        </Field>

        <Field label="Location" error={errors.location}>
          <input
            className="input"
            value={f.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Floor A · Bay 2"
          />
        </Field>
      </div>

      <Field label="Notes" hint="Optional · operator context">
        <textarea
          className="textarea"
          rows={3}
          value={f.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anything the next person should know."
        />
      </Field>

      {serverError && (
        <div className="text-sm text-signal-red border border-signal-red/30 bg-signal-red/5 px-3 py-2">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
          QR code generated on save
        </span>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Enrolling…" : "Enroll machine"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-300">
          {label}
        </span>
        {hint && !error && (
          <span className="mono text-[10px] text-ink-400">{hint}</span>
        )}
        {error && (
          <span className="mono text-[10px] text-signal-red">{error}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function labelFor(k: keyof Fields): string {
  const map: Record<keyof Fields, string> = {
    name: "Name",
    type: "Type",
    model: "Model",
    manufacturer: "Make",
    serialNumber: "Serial number",
    location: "Location",
    notes: "Notes",
  };
  return map[k];
}
