import React from "react";
import { Header } from "../components/ui.jsx";
import { C } from "../theme";
import { Calendar } from "lucide-react";

export default function Schedule({ sessions, subs, open }) {
  const weeks = [...new Set(sessions.map((s) => s.week))];
  const WC = [C.blue, C.red, C.purple, C.green, C.orange];
  return (
    <div className="fade-in">
      <Header eyebrow="Plan ahead" title="Cohort schedule" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>All the live sessions — each with its date and time on Zoom.</p>
      <div className="mt-8 space-y-6">
        {weeks.map((wk, wi) => { const col = WC[wi % WC.length]; return (
          <div key={wk}>
            <div className="mb-3"><span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white" style={{ background: col }}>{wk}</span></div>
            <div className="space-y-2">
              {sessions.filter((s) => s.week === wk).map((s) => { const locked = !s.is_open; const Tag = locked ? "div" : "button"; return (
                <Tag key={s.id} onClick={locked ? undefined : () => open(s.id)} className={(locked ? "" : "lift ") + "w-full flex items-center gap-4 rounded-2xl p-4 text-left"} style={{ background: C.card, border: `1px solid ${C.line}`, cursor: locked ? "default" : "pointer", opacity: locked ? 0.85 : 1 }}>
                  <div className="grid place-items-center h-12 w-12 rounded-xl shrink-0" style={{ background: `${col}18`, color: col }}><Calendar size={20} /></div>
                  <div className="min-w-0 flex-1"><div className="font-bold leading-snug truncate">Session {s.sort}: {s.title}</div><div className="text-xs" style={{ color: C.muted }}>{s.session_date || "TBC"} · {s.session_time || "7:00 PM WAT"}{s.facilitator ? ` · ${s.facilitator}` : ""}</div></div>
                  <span className="ml-auto text-xs font-bold" style={{ color: locked ? C.muted : C.blue }}>{locked ? "Upcoming" : "Open"}</span>
                </Tag>
              ); })}
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
