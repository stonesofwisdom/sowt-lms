import React, { useState } from "react";
import { Header, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { updateProfile } from "../db";
import { Check, ExternalLink, Copy, Globe, Lock } from "lucide-react";

export default function ProfileEditor({ profile }) {
  const [bio, setBio] = useState(profile.profile_bio || "");
  const [subjects, setSubjects] = useState(profile.profile_subjects || "");
  const [location, setLocation] = useState(profile.profile_location || "");
  const [contact, setContact] = useState(profile.profile_contact || profile.whatsapp_number || "");
  const [isPublic, setIsPublic] = useState(!!profile.profile_public);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = (typeof window !== "undefined" ? window.location.origin : "") + "/?tutor=" + profile.id;
  const inp = { background: C.bg, border: `1px solid ${C.line}` };

  async function save() {
    setBusy(true); setSaved(false);
    try {
      await updateProfile(profile.id, {
        profile_bio: bio.trim(), profile_subjects: subjects.trim(),
        profile_location: location.trim(), profile_contact: contact.trim(),
        profile_public: isPublic,
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  function copyLink() { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div className="fade-in">
      <Header eyebrow="Your shareable page" title="My public profile" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>Fill this in and switch it on to get a link you can send to parents and agencies. Your certified badge shows automatically once you've earned your certificate.</p>

      <div className="mt-6 rounded-3xl p-5 space-y-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Short bio</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few lines about you and your teaching approach…" className="mt-1 w-full resize-none rounded-2xl px-4 py-3 text-sm" style={inp} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Subjects & levels you teach</label>
          <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths & English (Primary–JSS), IELTS" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>Location (optional)</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria · Online" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>WhatsApp number for contact (with country code)</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. +234 801 234 5678" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
          <div className="mt-1 text-xs" style={{ color: C.muted }}>Shown as a "Message on WhatsApp" button on your public page.</div>
        </div>

        <button onClick={() => setIsPublic((v) => !v)} className="btn flex items-center justify-between w-full rounded-2xl px-4 py-3" style={{ background: isPublic ? "#E6F5EE" : C.bg, border: `1px solid ${isPublic ? C.green : C.line}` }}>
          <span className="flex items-center gap-2 text-sm font-bold" style={{ color: isPublic ? C.green : C.muted }}>{isPublic ? <Globe size={16} /> : <Lock size={16} />}{isPublic ? "Profile is public" : "Profile is private"}</span>
          <span className="text-xs font-bold" style={{ color: isPublic ? C.green : C.muted }}>{isPublic ? "Anyone with the link can view" : "Tap to make public"}</span>
        </button>

        <button onClick={save} disabled={busy} className="btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ background: C.blue, opacity: busy ? 0.7 : 1 }}>{busy ? <Spinner light /> : <Check size={16} />}{saved ? "Saved!" : "Save profile"}</button>
      </div>

      {isPublic && (
        <div className="mt-4 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: C.blue }}>Your shareable link</div>
          <div className="mt-2 rounded-xl px-3 py-2 text-sm font-mono break-all" style={inp}>{link}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={copyLink} className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.ink }}><Copy size={14} color={C.yellow} /> {copied ? "Copied!" : "Copy link"}</button>
            <a href={link} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold" style={{ background: C.card, border: `1px solid ${C.line}` }}><ExternalLink size={14} /> Preview</a>
          </div>
          <div className="mt-2 text-xs" style={{ color: C.muted }}>Remember to Save after changes so your public page updates.</div>
        </div>
      )}
    </div>
  );
}
