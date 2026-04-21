import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines [background-size:32px_32px] opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <LogoMark />
            <span className="display-type text-lg tracking-widest text-ink-100">
              MECHTRAK
            </span>
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-6">
            [ Sign in ]
          </div>
          <h1 className="display-type text-5xl text-ink-100 leading-[1] max-w-md">
            Back to the floor.
          </h1>
          <p className="text-ink-300 mt-4 max-w-md">
            Pick up where you left off. Overdue PMs are waiting; Gary isn't
            getting any younger.
          </p>
        </div>
        <div className="relative grid grid-cols-3 text-center gap-px bg-white/5">
          {[
            ["MX-A821", "Operational"],
            ["MX-19F3", "Scheduled"],
            ["MX-77C0", "Down"],
          ].map(([code, state]) => (
            <div key={code} className="bg-ink-900 px-3 py-4">
              <div className="mono text-[10px] tracking-[0.2em] text-ink-300">
                {code}
              </div>
              <div className="mono text-[10px] mt-2 text-ink-100 uppercase">
                {state}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm rise">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <LogoMark />
            <span className="display-type text-lg tracking-widest text-ink-100">
              MECHTRAK
            </span>
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.3em] text-rust-400 mb-3">
            [ Operator access ]
          </div>
          <h2 className="display-type text-3xl text-ink-100 mb-8">Sign In</h2>
          <LoginForm />
          <div className="mt-8 text-sm text-ink-300 border-t border-white/5 pt-6">
            No account yet?{" "}
            <Link
              href="/signup"
              className="text-rust-400 hover:text-rust-300 underline underline-offset-4"
            >
              Create your facility
            </Link>
          </div>
        </div>
      </section>
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
