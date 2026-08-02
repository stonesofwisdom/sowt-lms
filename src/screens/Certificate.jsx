import React, { useRef, useState } from "react";
import { Header, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { updateProfile } from "../db";
import { ai } from "../ai";
import { Lock, Award, Download, Linkedin, Check } from "lucide-react";

export default function Certificate({ profile, total, completed, attended }) {
  const eligible = total > 0 && completed >= total && attended >= total;
  const [name, setName] = useState(profile.certificate_name || profile.full_name || "");
  const [code, setCode] = useState(profile.certificate_code || "");
  const [line, setLine] = useState("");
  const [gen, setGen] = useState(!!profile.certificate_code);
  const [busy, setBusy] = useState(false);
  const svgRef = useRef(null);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  async function generate() {
    if (busy || !name.trim()) return; setBusy(true);
    const c = code || ("SOWT-" + Math.random().toString(36).slice(2, 8).toUpperCase());
    try { const l = await ai({ system: "Write ONE warm sentence (max 22 words) celebrating a tutor completing the Get Paid to Teach Online Masterclass by Stones of Wisdom Tutors. No quotes, just the sentence.", messages: [{ role: "user", content: `Name: ${name}` }], max_tokens: 120 }); setLine(l || ""); } catch (e) {}
    setCode(c); setGen(true);
    try { await updateProfile(profile.id, { certificate_code: c, certificate_name: name }); } catch (e) {}
    setBusy(false);
  }
  function download() {
    const svg = svgRef.current; if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 850;
      const cx = canvas.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, 1200, 850); cx.drawImage(img, 0, 0, 1200, 850);
      const a = document.createElement("a"); a.download = "SOWT-Certificate.png"; a.href = canvas.toDataURL("image/png"); a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
  }
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (!eligible) {
    return (
      <div className="fade-in">
        <Header eyebrow="The finish line" title="Certificate of Completion" />
        <div className="mt-6 rounded-3xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl" style={{ background: "#EDEAE0" }}><Lock size={26} color="#9A947F" /></div>
          <div className="mt-4 text-lg font-black">Your certificate is locked</div>
          <p className="mt-1 text-sm max-w-sm mx-auto" style={{ color: C.muted }}>Unlock it by completing every session's assignments and attending all the live classes.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="rounded-2xl p-3" style={{ background: C.bg }}><div className="text-2xl font-extrabold" style={{ color: C.blue }}>{completed}/{total}</div><div className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>Sessions done</div></div>
            <div className="rounded-2xl p-3" style={{ background: C.bg }}><div className="text-2xl font-extrabold" style={{ color: C.green }}>{attended}/{total}</div><div className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>Attended</div></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fade-in">
      <Header eyebrow="The finish line" title="Certificate of Completion" />
      <p className="mt-3 text-sm" style={{ color: C.muted }}>You did it — all sessions complete and attended. Generate your certificate below.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div><label className="text-xs font-bold uppercase" style={{ color: C.muted }}>Name on certificate</label><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: C.card, border: `1px solid ${C.line}` }} /></div>
        <button onClick={generate} disabled={busy || !name.trim()} className="btn inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white" style={{ background: C.blue, opacity: busy || !name.trim() ? 0.6 : 1 }}>{busy ? <Spinner light /> : <Award size={16} />}{gen ? "Regenerate" : "Generate my certificate"}</button>
      </div>
      {gen && (<>
        <div className="mt-8 overflow-x-auto">
          <svg ref={svgRef} viewBox="0 0 1200 850" width="1200" height="850" style={{ maxWidth: "100%", height: "auto", border: `1px solid ${C.line}`, borderRadius: 16 }} xmlns="http://www.w3.org/2000/svg">
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
            {line && <text x="600" y="605" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontStyle="italic" fill={C.muted}>{line.length > 90 ? line.slice(0, 90) + "…" : line}</text>}
            <text x="330" y="720" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="22" fontWeight="700" fill={C.ink}>{today}</text>
            <text x="330" y="748" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="16" fill={C.muted}>Date</text>
            <text x="870" y="720" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="22" fontWeight="700" fill={C.ink}>Stones of Wisdom Tutors</text>
            <text x="870" y="748" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="16" fill={C.muted}>Programme Lead</text>
            <circle cx="600" cy="710" r="46" fill={C.red} /><circle cx="600" cy="710" r="46" fill="none" stroke={C.yellow} strokeWidth="4" />
            <text x="600" y="705" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#fff">SOWT</text>
            <text x="600" y="725" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="10" fill="#fff">CERTIFIED</text>
            {code && <text x="600" y="798" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="13" fill={C.muted}>Certificate ID: {code}</text>}
          </svg>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={download} className="btn inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white" style={{ background: C.ink }}><Download size={16} color={C.yellow} /> Download (PNG)</button>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white" style={{ background: "#0A66C2" }}><Linkedin size={16} /> Share on LinkedIn</a>
          {code && <div className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: C.blue }}><Check size={14} /> {code}</div>}
        </div>
      </>)}
    </div>
  );
}
