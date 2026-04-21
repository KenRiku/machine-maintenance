import Link from "next/link";
import { redirect } from "next/navigation";
import { optionalSession } from "@/lib/auth";

export default async function Home() {
  const session = await optionalSession();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="display-type text-lg tracking-widest text-ink-100">
              MECHTRAK
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started →
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-[1.2fr_1fr] gap-16">
          <div className="rise">
            <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-6">
              [ v0.1 — Industrial CMMS + AI Assistant ]
            </div>
            <h1 className="display-type text-5xl md:text-7xl text-ink-100 leading-[0.95] mb-6">
              Every machine.
              <br />
              <span className="text-rust-400">Every repair.</span>
              <br />
              One honest system.
            </h1>
            <p className="text-ink-200 text-lg max-w-xl leading-relaxed mb-8">
              MechTrak replaces spreadsheets, sticky notes, and
              retirement-bound tribal knowledge with a platform that tracks every
              asset, schedules every preventive maintenance, logs every repair,
              and hands your floor an AI that knows the equipment cold.
            </p>

            <div className="flex items-center gap-3 mb-16">
              <Link href="/signup" className="btn-primary">
                Enroll your facility
              </Link>
              <Link href="/login" className="btn">
                I have an account
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5">
              {[
                ["Registry", "QR-tagged"],
                ["PM Schedules", "Auto-generated"],
                ["Service Logs", "Append-only"],
                ["AI Assist", "Per-machine"],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink-900 px-4 py-3">
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300">
                    {k}
                  </div>
                  <div className="text-ink-100 text-sm mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rise" style={{ animationDelay: "120ms" }}>
            <div className="panel grain relative">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal-green pulse-line" />
                  <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink-200">
                    MX-8F31C2 · CNC Lathe L-3000
                  </span>
                </div>
                <span className="chip-op">Operational</span>
              </div>
              <div className="grid grid-cols-3 text-center">
                {[
                  ["1,428", "hrs since overhaul"],
                  ["3", "open PMs"],
                  ["0", "critical faults"],
                ].map(([n, l]) => (
                  <div
                    key={l}
                    className="py-5 border-r last:border-r-0 border-white/5"
                  >
                    <div className="display-type text-3xl text-rust-400">
                      {n}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300 mt-1">
                      {l}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 tick-bar">
                <div className="text-xs mono text-ink-300 mb-2">
                  UPCOMING · NEXT 30 DAYS
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    ["Spindle bearing lube", "7 days", "warn"],
                    ["Way oil check", "14 days", "info"],
                    ["Coolant filter change", "22 days", "info"],
                  ].map(([t, d, k]) => (
                    <li
                      key={t}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-ink-100">{t}</span>
                      <span
                        className={
                          k === "warn" ? "chip-warn" : "chip-info"
                        }
                      >
                        {d}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t border-white/5 bg-ink-950/60">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-ink-300 mb-2">
                  Assistant
                </div>
                <div className="text-sm text-ink-200">
                  "Chatter on finishing passes usually means a worn insert or a
                  spindle bearing on its way out. Last service log for this
                  machine shows a BT40 collet replacement 42 days ago…"
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 panel-inset px-3 py-2 hidden sm:block">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-signal-amber">
                ◉ Live
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {[
              [
                "01",
                "Registry",
                "Enroll machines, tag them with QR codes, and carry the whole fleet in your pocket.",
              ],
              [
                "02",
                "Preventive maintenance",
                "Define PM schedules by interval and let MechTrak spin up work orders automatically.",
              ],
              [
                "03",
                "AI Repair Assistant",
                "Chat with an assistant that reads each machine's spec sheet and service history.",
              ],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="bg-ink-900 p-8 border-t-2 border-t-transparent hover:border-t-rust-400 transition-colors"
              >
                <div className="mono text-xs text-rust-400 tracking-[0.3em] mb-4">
                  {n}
                </div>
                <div className="display-type text-xl text-ink-100 mb-3">
                  {t}
                </div>
                <p className="text-sm text-ink-300 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs mono text-ink-300 uppercase tracking-[0.2em]">
          <span>MechTrak · Machine Maintenance as a Service</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
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
