import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Logo, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function Verify({ initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // {valid, name} | {valid:false}
  const [checked, setChecked] = useState(false);

  async function check(c) {
    const val = (c ?? code).trim();
    if (!val) return;
    setBusy(true); setChecked(false);
    try {
      const { data, error } = await supabase.rpc("verify_certificate", { code: val });
      if (error) throw error;
      if (data && data.length > 0) setResult({ valid: true, name: data[0].name });
      else setResult({ valid: false });
    } catch (e) {
      setResult({ valid: false });
    }
    setChecked(true); setBusy(false);
  }

  useEffect(() => { if (initialCode) check(initialCode); }, []);

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo height={56} /></div>
        <div className="rounded-3xl p-7" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: C.blue }}><ShieldCheck size={16} /> Certificate verification</div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">Verify a certificate</h1>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>Enter the Certificate ID printed on a Stones of Wisdom Tutors certificate.</p>

          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") check(); }} placeholder="e.g. SOWT-A7X2K9" className="flex-1 rounded-2xl px-4 py-3 text-sm font-mono" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
            <button onClick={() => check()} disabled={busy || !code.trim()} className="btn rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ background: C.blue, opacity: busy || !code.trim() ? 0.6 : 1 }}>{busy ? <Spinner light /> : "Verify"}</button>
          </div>

          {checked && result?.valid && (
            <div className="fade-in mt-5 rounded-2xl p-5 text-center" style={{ background: "#E6F5EE" }}>
              <CheckCircle2 size={40} color={C.green} className="mx-auto" />
              <div className="mt-2 text-lg font-black" style={{ color: C.green }}>Valid certificate</div>
              <div className="mt-1 text-sm">Issued to <b>{result.name}</b> for completing the</div>
              <div className="text-sm font-bold">Get Paid to Teach Online — Masterclass</div>
              <div className="mt-2 text-xs" style={{ color: C.muted }}>Stones of Wisdom Tutors</div>
            </div>
          )}
          {checked && result && !result.valid && (
            <div className="fade-in mt-5 rounded-2xl p-5 text-center" style={{ background: "#FDECEC" }}>
              <XCircle size={40} color={C.red} className="mx-auto" />
              <div className="mt-2 text-lg font-black" style={{ color: C.red }}>Not found</div>
              <div className="mt-1 text-sm" style={{ color: C.muted }}>We couldn't find a certificate with that ID. Check the code and try again.</div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center"><a href="/" className="text-xs font-bold" style={{ color: C.muted }}>Go to Stones of Wisdom Tutors →</a></div>
      </div>
    </div>
  );
}
