"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-white/5 bg-ink-950/40 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 mono text-[11px] uppercase tracking-[0.25em] text-ink-300">
          <span className="w-2 h-2 bg-signal-green rounded-full pulse-line" />
          <span>Live · Floor ops</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-ink-100">{name}</div>
            <div className="mono text-[10px] text-ink-300 uppercase tracking-[0.15em]">
              {email}
            </div>
          </div>
          <div className="w-9 h-9 border border-white/10 bg-ink-800 flex items-center justify-center display-type text-rust-400">
            {name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            disabled={loading}
            className="btn-ghost text-xs"
          >
            {loading ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
