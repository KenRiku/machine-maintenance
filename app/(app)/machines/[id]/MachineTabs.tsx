"use client";

import { useState } from "react";
import OverviewTab from "./tabs/OverviewTab";
import MaintenanceTab from "./tabs/MaintenanceTab";
import HistoryTab from "./tabs/HistoryTab";
import PartsTab from "./tabs/PartsTab";
import AssistantTab from "./tabs/AssistantTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "maintenance", label: "Maintenance" },
  { id: "history", label: "Service History" },
  { id: "parts", label: "Parts" },
  { id: "assistant", label: "Ask AI" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MachineTabs(props: any) {
  const [tab, setTab] = useState<TabId>(
    (TABS.find((t) => t.id === props.initialTab)?.id as TabId) || "overview",
  );

  return (
    <div>
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((t, i) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`relative px-4 py-3 text-sm uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                active
                  ? "text-ink-100"
                  : "text-ink-300 hover:text-ink-100"
              }`}
            >
              <span className="mono text-[10px] tracking-[0.25em] text-ink-400 mr-2">
                0{i + 1}
              </span>
              {t.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-px bg-rust-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {tab === "overview" && <OverviewTab machine={props.machine} />}
        {tab === "maintenance" && (
          <MaintenanceTab
            machineId={props.machine.id}
            schedules={props.schedules}
            workOrders={props.workOrders}
          />
        )}
        {tab === "history" && (
          <HistoryTab
            serviceLogs={props.serviceLogs}
            workOrders={props.workOrders}
          />
        )}
        {tab === "parts" && (
          <PartsTab
            machineId={props.machine.id}
            parts={props.compatibleParts}
          />
        )}
        {tab === "assistant" && (
          <AssistantTab
            machine={props.machine}
            initialMessages={props.chatMessages}
          />
        )}
      </div>
    </div>
  );
}
