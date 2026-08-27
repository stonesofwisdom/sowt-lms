import React, { useState } from "react";
import { Logo } from "../components/ui.jsx";
import { C } from "../theme";
import { Menu, X, LogOut } from "lucide-react";

const NAVY = "#0E1A3A";
const NAVY2 = "#16265A";

export default function Shell({ roleLabel, roleColor, nav, tab, setTab, profile, onSignOut, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className={`${open ? "fixed inset-0 z-40 block" : "hidden"} md:static md:block`}>
        {open && <div className="absolute inset-0 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
        <div className="relative h-screen w-72 md:w-64 flex flex-col p-5 md:sticky md:top-0 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl px-1 py-0.5"><Logo height={34} /></div>
            <button className="md:hidden" onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.7)" }}><X size={22} /></button>
          </div>
          {roleLabel && <div className="mb-6 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide" style={{ background: roleColor || C.yellow, color: (roleColor ? "#fff" : C.ink) }}>{roleLabel}</div>}
          <nav className="flex flex-col gap-1.5">
            {nav.map((n) => { const A = n.icon; const active = tab === n.id; return (
              <button key={n.id} onClick={() => { setTab(n.id); setOpen(false); }} className="btn flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors" style={active ? { background: "rgba(255,255,255,0.12)", color: "#fff" } : { color: "rgba(255,255,255,0.62)" }}>
                <A size={19} color={active ? C.yellow : "rgba(255,255,255,0.62)"} />
                <span className="flex-1">{n.label}</span>
                {n.dot && <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.red }} />}
              </button>
            ); })}
          </nav>
          <div className="mt-auto pt-6 sticky bottom-0" style={{ background: NAVY2 }}>
            <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="text-sm font-bold truncate text-white">{profile.full_name || profile.email}</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{profile.email}</div>
              <button onClick={onSignOut} className="mt-2 inline-flex items-center gap-2 text-xs font-bold" style={{ color: C.yellow }}><LogOut size={14} /> Sign out</button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-h-screen">
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3" style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
          <Logo height={28} />
          <div className="flex items-center gap-2">
            <button onClick={onSignOut} title="Sign out" className="btn rounded-xl p-2" style={{ background: C.bg, color: C.muted }}><LogOut size={18} /></button>
            <button onClick={() => setOpen(true)} className="btn rounded-xl p-2 text-white" style={{ background: NAVY }}><Menu size={20} /></button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-5 md:px-10 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
