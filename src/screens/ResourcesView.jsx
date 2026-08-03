import React, { useEffect, useState } from "react";
import { Header, Loading } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchResources } from "../db";
import { Folder, ExternalLink } from "lucide-react";

export default function ResourcesView() {
  const [rows, setRows] = useState(null);
  useEffect(() => { fetchResources().then(setRows); }, []);
  if (!rows) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow="Useful links & materials" title="Resources" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>Handpicked links, downloads, and materials to help you as you go.</p>
      <div className="mt-8 space-y-3">
        {rows.length === 0 && <div className="rounded-3xl p-8 text-center text-sm" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted }}>No resources yet — check back soon.</div>}
        {rows.map((r) => (
          <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="lift flex items-center gap-4 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="grid place-items-center h-12 w-12 rounded-xl shrink-0" style={{ background: "#EEF0FE", color: C.blue }}><Folder size={20} /></div>
            <div className="min-w-0 flex-1"><div className="font-bold truncate">{r.title}</div>{r.description && <div className="text-xs mt-0.5 line-clamp-2" style={{ color: C.muted }}>{r.description}</div>}</div>
            <ExternalLink size={16} color={C.muted} />
          </a>
        ))}
      </div>
    </div>
  );
}
