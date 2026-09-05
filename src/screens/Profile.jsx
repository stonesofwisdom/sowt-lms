import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Logo, Loading } from "../components/ui.jsx";
import { C } from "../theme";
import { ShieldCheck, MapPin, BookOpen, MessageCircle, UserX } from "lucide-react";

export default function Profile({ tutorId }) {
  const [p, setP] = useState(undefined); // undefined=loading, null=not found

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

  return (
    <div className="min-h-screen px-5 py-10" style={{ background: C.bg }}>
      <div className="w-full max-w-lg mx-auto">
        <div className="flex justify-center mb-8"><Logo height={48} /></div>
        <div className="rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="p-7 text-center text-white" style={{ background: C.blue }}>
            <div className="mx-auto grid place-items-center h-24 w-24 rounded-full text-2xl font-black" style={{ background: "rgba(255,255,255,.18)" }}>{initials}</div>
            <h1 className="mt-4 text-2xl font-extrabold">{p.name}</h1>
            {p.certified && <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black" style={{ background: C.yellow, color: C.ink }}><ShieldCheck size={14} /> SOWT Certified Tutor</div>}
          </div>
          <div className="p-6 space-y-5">
            {p.bio && <p className="text-[15px] leading-relaxed">{p.bio}</p>}
            {p.subjects && <div className="flex items-start gap-3"><BookOpen size={18} color={C.blue} className="mt-0.5 shrink-0" /><div><div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>Subjects & levels</div><div className="text-sm font-semibold">{p.subjects}</div></div></div>}
            {p.location && <div className="flex items-start gap-3"><MapPin size={18} color={C.blue} className="mt-0.5 shrink-0" /><div><div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>Location</div><div className="text-sm font-semibold">{p.location}</div></div></div>}
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="btn flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ background: C.green }}><MessageCircle size={17} /> Message on WhatsApp</a>}
          </div>
          <div className="px-6 py-4 text-center text-xs" style={{ background: C.bg, color: C.muted }}>Trained & certified by <b>Stones of Wisdom Tutors</b></div>
        </div>
        <div className="mt-4 text-center"><a href="/" className="text-xs font-bold" style={{ color: C.muted }}>Get Paid to Teach Online — Masterclass →</a></div>
      </div>
    </div>
  );
}
