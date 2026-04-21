import Link from "next/link";
import { requireSession } from "@/lib/auth";
import NewMachineForm from "./NewMachineForm";

export default async function NewMachinePage() {
  await requireSession();
  return (
    <div className="max-w-3xl mx-auto rise">
      <div className="mb-6">
        <Link
          href="/machines"
          className="mono text-[11px] uppercase tracking-[0.25em] text-ink-300 hover:text-rust-400"
        >
          ← Back to registry
        </Link>
      </div>
      <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-2">
        [ New asset ]
      </div>
      <h1 className="display-type text-4xl text-ink-100 mb-2">
        Enroll a machine
      </h1>
      <p className="text-ink-300 text-sm mb-8 max-w-lg">
        Record the basics. MechTrak generates a unique code, a QR tag, and a
        permanent service ledger the moment you save.
      </p>
      <div className="panel p-6">
        <NewMachineForm />
      </div>
    </div>
  );
}
