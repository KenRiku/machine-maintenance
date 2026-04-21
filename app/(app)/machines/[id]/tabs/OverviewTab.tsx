"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { machineCode } from "@/lib/utils";

type Machine = {
  id: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

export default function OverviewTab({ machine }: { machine: Machine }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const payload = JSON.stringify({
      code: machineCode(machine.id),
      id: machine.id,
      name: machine.name,
    });
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: {
        dark: "#F47D1D",
        light: "#07090C",
      },
    }).then(setQr);
  }, [machine.id, machine.name]);

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <div className="panel p-6">
        <h3 className="display-type text-lg text-ink-100 mb-4">
          Machine specs
        </h3>
        <dl className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
          <Row label="Name" value={machine.name} />
          <Row label="Type" value={machine.type} />
          <Row label="Manufacturer" value={machine.manufacturer} />
          <Row label="Model" value={machine.model} />
          <Row label="Serial" value={machine.serialNumber} mono />
          <Row label="Location" value={machine.location} />
          <Row label="Status" value={machine.status} mono />
          <Row
            label="Internal code"
            value={machineCode(machine.id)}
            mono
          />
        </dl>

        {machine.notes && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-2">
              Operator notes
            </div>
            <p className="text-ink-200 text-sm leading-relaxed whitespace-pre-wrap">
              {machine.notes}
            </p>
          </div>
        )}
      </div>

      <div className="panel p-6 flex flex-col items-center">
        <div className="mono text-[10px] uppercase tracking-[0.25em] text-ink-300 mb-4 self-start">
          QR Tag · scan to open
        </div>
        {qr ? (
          <img
            src={qr}
            alt="Machine QR code"
            className="w-64 h-64 border border-white/5"
          />
        ) : (
          <div className="w-64 h-64 bg-ink-800 flex items-center justify-center text-ink-400 mono text-xs">
            generating…
          </div>
        )}
        <div className="mt-4 text-center">
          <div className="display-type text-xl text-rust-400">
            {machineCode(machine.id)}
          </div>
          <div className="mono text-[10px] text-ink-300 uppercase tracking-[0.2em] mt-1">
            Print & stick it on the machine
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="mono text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-1">
        {label}
      </dt>
      <dd className={`text-ink-100 ${mono ? "mono text-sm" : ""}`}>{value}</dd>
    </div>
  );
}
