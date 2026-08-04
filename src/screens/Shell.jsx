import React, { useState } from "react";
import { Logo } from "../components/ui.jsx";
import { C } from "../theme";
import { Menu, X, LogOut } from "lucide-react";

export default function Shell({ roleLabel, roleColor, nav, tab, setTab, profile, onSignOut, children }) {

  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className={`${open ? "fixed inset-0 z-40 block" : "hidden"} md:static md:block`}>
        {open && <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
        <div className="relative h-screen w-72 md:w-64 flex flex-col p-5 md:sticky md:top-0 overflow-y-auto" style={{ background: C.card, borderRight: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between mb-2"><Logo height={34} /><button className="md:hidden" onClick={() => setOpen(false)} style={{ color: C.muted }}><X size={22} /></button></div>
          {roleLabel && <div className="mb-6 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white" style={{ background: roleColor || C.blue }}>{roleLabel}</div>}
          <nav className="flex flex-col gap-1">
            {nav.map((n) => { const A = n.icon; const active = tab === n.id; return (
              <button key={n.id} onClick={() => { setTab(n.id); setOpen(false); }} className="btn flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold" style={active ? { background: "#EEF0FE", color: C.blue } : { color: C.muted }}><A size={18} /><span className="flex-1">{n.label}</span>{n.dot && <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.red }} />}</button>
            ); })}
          </nav>
          <div className="mt-auto pt-6 sticky bottom-0" style={{ background: C.card }}>
            <div className="text-sm font-bold truncate">{profile.full_name || profile.email}</div>
            <div className="text-xs truncate" style={{ color: C.muted }}>{profile.email}</div>
            <button onClick={onSignOut} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold" style={{ color: C.muted }}><LogOut size={14} /> Sign out</button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-h-screen">
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3" style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
          <Logo height={28} />
          <div className="flex items-center gap-2">
            <button onClick={onSignOut} title="Sign out" className="btn rounded-xl p-2" style={{ background: C.bg, color: C.muted }}><LogOut size={18} /></button>
            <button onClick={() => setOpen(true)} className="btn rounded-xl p-2" style={{ background: "#EEF0FE", color: C.blue }}><Menu size={20} /></button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-5 md:px-10 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
