import React, { useState } from "react";
import { supabase } from "../supabase";
import { Logo, Spinner } from "../components/ui.jsx";
import { C } from "../theme";

export default function ResetPassword({ onDone }) {
  const [pw, setPw] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function save() {
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setMsg(error.message);
    else { setMsg("Password updated — you're signed in."); setTimeout(() => onDone && onDone(), 800); }
  }
  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo height={60} /></div>
        <div className="rounded-3xl p-7" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Almost there</div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">Set a new password</h1>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="New password" onKeyDown={(e) => { if (e.key === "Enter") save(); }} className="mt-5 w-full rounded-2xl px-4 py-3 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
          <button onClick={save} disabled={busy} className="btn mt-4 w-full rounded-2xl px-5 py-3 text-sm font-bold text-white inline-flex items-center justify-center gap-2" style={{ background: C.blue, opacity: busy ? 0.7 : 1 }}>{busy ? <Spinner light /> : null}Save new password</button>
          {msg && <div className="mt-3 text-xs" style={{ color: C.muted }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
