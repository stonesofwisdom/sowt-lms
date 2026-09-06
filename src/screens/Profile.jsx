import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Logo, Loading } from "../components/ui.jsx";
import { C } from "../theme";
import { ShieldCheck, MapPin, BookOpen, MessageCircle, UserX, GraduationCap, Award, Clock, TrendingUp, PlayCircle, ArrowRight } from "lucide-react";

export default function Profile({ tutorId }) {
  const [p, setP] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("public_tutor_profile", { pid: tutorId });
        if (error) throw error;
        setP(data && data.length > 0 ? data[0] : null);
      } catch (e) { setP(null); }
    })();
  }, [tutorId]);

  if (p === undefined) return <div className="min-h-screen grid place-items-center"><Loading /></div>;

  if (p === null) return (
    <div className="min-h-screen grid place-items-center px-5 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={52} /></div>
        <div className="rounded-3xl p-8" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <UserX size={40} color={C.muted} className="mx-auto" />
          <div className="mt-3 text-lg font-black">Profile not available</div>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>This tutor profile is private or doesn't exist.</p>
          <a href="/" className="btn inline-block mt-4 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.blue }}>Visit Stones of Wisdom Tutors</a>
        </div>
      </div>
    </div>
  );

  const waLink = p.contact ? "https://wa.me/" + p.contact.replace(/[^0-9]/g, "") : null;
  const initials = (p.name || "T").split(" ").map((x) => x[0]).slice(0, 2).join("");
  const verifyLink = p.cert_code ? "/?verify=" + encodeURIComponent(p.cert_code) : "/?verify=";

  const Row = ({ icon: Icon, label, value }) => value ? (
    <div className="flex items-start gap-3">
      <Icon size={18} color={C.blue} className="mt-0.5 shrink-0" />
      <div><div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{label}</div><div className="text-sm font-semibold">{value}</div></div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen px-5 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-lg mx-auto">
        <div className="flex justify-center mb-8"><Logo height={48} /></div>
        <div className="rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          {/* Photo + headline */}
          <div className="p-7 text-center text-white" style={{ background: "linear-gradient(135deg, #0E1A3A 0%, #16265A 100%)" }}>
            <div className="mx-auto h-28 w-28 rounded-full overflow-hidden grid place-items-center" style={{ background: "rgba(255,255,255,.18)", border: "3px solid rgba(255,255,255,.35)" }}>
              {p.photo ? <img src={p.photo} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-3xl font-black">{initials}</span>}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">{p.name}</h1>
            {p.tagline && <div className="mt-1 text-sm font-semibold text-white/85">{p.tagline}</div>}
            {p.certified && <a href={verifyLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black" style={{ background: C.yellow, color: C.ink }}><ShieldCheck size={14} /> SOWT Certified · Verify</a>}
          </div>

          <div className="p-6 space-y-5">
            {/* First sentence */}
            {p.bio && <p className="text-[15px] leading-relaxed">{p.bio}</p>}

            {/* Proof — highlighted */}
            {p.proof && (
              <div className="rounded-2xl p-4" style={{ background: "#FFF9DC", border: `1px solid ${C.yellow}` }}>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide" style={{ color: C.red }}><TrendingUp size={14} /> Results</div>
                <div className="mt-1 text-sm font-semibold">{p.proof}</div>
              </div>
            )}

            <Row icon={BookOpen} label="Subjects & levels" value={p.subjects} />
            <Row icon={GraduationCap} label="Qualifications" value={p.quals} />
            <Row icon={Award} label="Experience" value={p.experience} />
            <Row icon={Clock} label="Availability" value={p.availability} />
            <Row icon={MapPin} label="Location" value={p.location} />

            {p.video && <a href={p.video} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.blue }}><PlayCircle size={18} /> Watch my short intro</a>}

            {/* What happens next */}
            {p.getstarted && (
              <div className="rounded-2xl p-4" style={{ background: "#EEF0FE" }}>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide" style={{ color: C.blue }}><ArrowRight size={14} /> How to get started</div>
                <div className="mt-1 text-sm font-semibold">{p.getstarted}</div>
              </div>
            )}

            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="btn flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ background: C.green }}><MessageCircle size={17} /> Message on WhatsApp</a>}
          </div>
          <div className="px-6 py-4 text-center text-xs" style={{ background: C.bg, color: C.muted }}>Trained & certified by <b>Stones of Wisdom Tutors</b></div>
        </div>
        <div className="mt-4 text-center"><a href="/" className="text-xs font-bold" style={{ color: C.muted }}>Get Paid to Teach Online — Masterclass →</a></div>
      </div>
    </div>
  );
}
