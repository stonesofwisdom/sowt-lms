import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Logo, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

function CertificateView({ name, code, issued }) {
  const dateStr = issued ? new Date(issued).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 1200 850" width="1200" height="850" style={{ maxWidth: "100%", height: "auto", border: `1px solid ${C.line}`, borderRadius: 16 }} xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="850" fill="#FFFFFF" />
        <rect x="30" y="30" width="1140" height="790" fill="none" stroke={C.blue} strokeWidth="6" rx="14" />
        <rect x="30" y="30" width="1140" height="16" fill={C.yellow} rx="8" />
        <rect x="30" y="804" width="1140" height="16" fill={C.red} rx="8" />
        <text x="600" y="150" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="26" letterSpacing="6" fill={C.muted}>STONES OF WISDOM TUTORS</text>
        <text x="600" y="235" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="52" fontWeight="900" fill={C.ink}>CERTIFICATE OF COMPLETION</text>
        <text x="600" y="320" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="24" fill={C.muted}>This certifies that</text>
        <text x="600" y="410" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="60" fontWeight="800" fill={C.blue}>{name}</text>
        <line x1="350" y1="440" x2="850" y2="440" stroke={C.line} strokeWidth="2" />
        <text x="600" y="500" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="26" fill={C.ink}>has successfully completed the</text>
        <text x="600" y="545" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="30" fontWeight="700" fill={C.ink}>Get Paid to Teach Online — Masterclass</text>
        {dateStr && <text x="330" y="720" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="22" fontWeight="700" fill={C.ink}>{dateStr}</text>}
        {dateStr && <text x="330" y="748" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="16" fill={C.muted}>Date</text>}
        <text x="870" y="720" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="22" fontWeight="700" fill={C.ink}>Stones of Wisdom Tutors</text>
        <text x="870" y="748" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="16" fill={C.muted}>Programme Lead</text>
        <circle cx="600" cy="710" r="46" fill={C.red} /><circle cx="600" cy="710" r="46" fill="none" stroke={C.yellow} strokeWidth="4" />
        <text x="600" y="705" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#fff">SOWT</text>
        <text x="600" y="725" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="10" fill="#fff">CERTIFIED</text>
        {code && <text x="600" y="798" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="13" fill={C.muted}>Certificate ID: {code}</text>}
      </svg>
    </div>
  );
}

export default function Verify({ initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);

  async function check(c) {
    const val = (c ?? code).trim();
    if (!val) return;
    setBusy(true); setChecked(false);
    try {
      const { data, error } = await supabase.rpc("verify_certificate", { code: val });
      if (error) throw error;
      if (data && data.length > 0) setResult({ valid: true, name: data[0].name, code: data[0].cert_code, issued: data[0].issued_at });
      else setResult({ valid: false });
    } catch (e) {
      setResult({ valid: false });
    }
    setChecked(true); setBusy(false);
  }

  useEffect(() => { if (initialCode) check(initialCode); }, []);

  return (
    <div className="min-h-screen px-5 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-2xl mx-auto">
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
            <div className="fade-in mt-5">
              <div className="rounded-2xl p-4 text-center" style={{ background: "#E6F5EE" }}>
                <CheckCircle2 size={34} color={C.green} className="mx-auto" />
                <div className="mt-1.5 text-lg font-black" style={{ color: C.green }}>Valid certificate</div>
                <div className="mt-0.5 text-sm">Issued to <b>{result.name}</b></div>
              </div>
              <div className="mt-4"><CertificateView name={result.name} code={result.code} issued={result.issued} /></div>
              <div className="mt-2 text-center text-xs" style={{ color: C.muted }}>This is a view-only verification of an authentic certificate.</div>
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
