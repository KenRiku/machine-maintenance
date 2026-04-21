import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md rise">
          <div className="flex items-center gap-3 mb-10">
            <LogoMark />
            <span className="display-type text-lg tracking-widest text-ink-100">
              MECHTRAK
            </span>
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-3">
            [ Enroll facility ]
          </div>
          <h2 className="display-type text-3xl text-ink-100 mb-2">
            Create Account
          </h2>
          <p className="text-ink-300 text-sm mb-8">
            Stand up a facility, invite your crew, and start enrolling machines
            in under five minutes.
          </p>
          <SignupForm />
          <div className="mt-8 text-sm text-ink-300 border-t border-white/5 pt-6">
            Already onboarded?{" "}
            <Link
              href="/login"
              className="text-rust-400 hover:text-rust-300 underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <aside className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-l border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines [background-size:32px_32px] opacity-40" />
        <div className="relative">
          <h1 className="display-type text-5xl text-ink-100 leading-[1] mb-4">
            Bring the <span className="text-rust-400">whole fleet</span> online.
          </h1>
          <p className="text-ink-300 max-w-md">
            Create an organization, enroll your first machine, and MechTrak
            starts tracking it. Every PM, every repair, every part ordered —
            captured once, searchable forever.
          </p>
        </div>
        <ul className="relative space-y-3 text-sm">
          {[
            ["Unlimited machines", "during prototype"],
            ["AI assistant", "per machine"],
            ["Service history", "append-only ledger"],
            ["QR tags", "auto-generated"],
          ].map(([t, s]) => (
            <li
              key={t}
              className="flex items-center justify-between px-4 py-3 bg-ink-900 border border-white/5"
            >
              <span className="text-ink-100">{t}</span>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
                {s}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}

function LogoMark() {
  return (
    <div className="relative w-8 h-8 border border-rust-400/60 flex items-center justify-center">
      <div className="absolute inset-0 bg-diagonal-hatch" />
      <div className="relative w-2 h-2 bg-rust-400" />
    </div>
  );
}
