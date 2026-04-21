"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", code: "01" },
  { href: "/machines", label: "Machines", code: "02" },
  { href: "/work-orders", label: "Work Orders", code: "03" },
  { href: "/parts", label: "Parts", code: "04" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-white/5 bg-ink-950/60 sticky top-0 h-screen">
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <LogoMark />
          <span className="display-type text-sm tracking-[0.25em] text-ink-100">
            MECHTRAK
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm relative group border-l-2",
                active
                  ? "border-l-rust-400 bg-white/[0.03] text-ink-100"
                  : "border-l-transparent text-ink-200 hover:text-ink-100 hover:bg-white/[0.02]",
              )}
            >
              <span
                className={cn(
                  "mono text-[10px] tracking-[0.2em]",
                  active ? "text-rust-400" : "text-ink-400",
                )}
              >
                {item.code}
              </span>
              <span className="uppercase tracking-[0.1em] text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <div className="mono text-[10px] tracking-[0.2em] uppercase text-ink-400">
          Build
        </div>
        <div className="mono text-xs text-ink-200 mt-1">v0.1 — prototype</div>
      </div>
    </aside>
  );
}

function LogoMark() {
  return (
    <div className="relative w-7 h-7 border border-rust-400/60 flex items-center justify-center">
      <div className="absolute inset-0 bg-diagonal-hatch" />
      <div className="relative w-1.5 h-1.5 bg-rust-400" />
    </div>
  );
}
