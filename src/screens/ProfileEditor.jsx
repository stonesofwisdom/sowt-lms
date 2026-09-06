import React, { useState, useRef } from "react";
import { Header, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { updateProfile, uploadAvatar } from "../db";
import { Check, ExternalLink, Copy, Globe, Lock, Camera, ChevronDown, ChevronUp } from "lucide-react";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted }}>{label}</label>
      {children}
      {hint && <div className="mt-1 text-xs" style={{ color: C.muted }}>{hint}</div>}
    </div>
  );
}

export default function ProfileEditor({ profile }) {
  const [photo, setPhoto] = useState(profile.profile_photo || "");
  const [tagline, setTagline] = useState(profile.profile_tagline || "");
  const [bio, setBio] = useState(profile.profile_bio || "");
  const [proof, setProof] = useState(profile.profile_proof || "");
  const [getStarted, setGetStarted] = useState(profile.profile_getstarted || "");
  const [subjects, setSubjects] = useState(profile.profile_subjects || "");
  const [quals, setQuals] = useState(profile.profile_quals || "");
  const [experience, setExperience] = useState(profile.profile_experience || "");
  const [availability, setAvailability] = useState(profile.profile_availability || "");
  const [location, setLocation] = useState(profile.profile_location || "");
  const [video, setVideo] = useState(profile.profile_video || "");
  const [contact, setContact] = useState(profile.profile_contact || profile.whatsapp_number || "");
  const [isPublic, setIsPublic] = useState(!!profile.profile_public);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const link = (typeof window !== "undefined" ? window.location.origin : "") + "/?tutor=" + profile.id;
  const inp = { background: C.bg, border: `1px solid ${C.line}` };
  const initials = (profile.full_name || "T").split(" ").map((x) => x[0]).slice(0, 2).join("");

  async function pickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return; setErr("");
    if (!/^image\//.test(f.type)) { setErr("Please choose an image."); return; }
    if (f.size > 5 * 1024 * 1024) { setErr("Photo too large (max 5MB)."); return; }
    setUploading(true);
    try { const url = await uploadAvatar(profile.id, f); setPhoto(url); }
    catch (e2) { setErr(e2.message || "Upload failed."); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    setBusy(true); setSaved(false);
    try {
      await updateProfile(profile.id, {
        profile_photo: photo, profile_tagline: tagline.trim(), profile_bio: bio.trim(),
        profile_proof: proof.trim(), profile_getstarted: getStarted.trim(),
        profile_subjects: subjects.trim(), profile_quals: quals.trim(),
        profile_experience: experience.trim(), profile_availability: availability.trim(),
        profile_location: location.trim(), profile_video: video.trim(),
        profile_contact: contact.trim(), profile_public: isPublic,
      });
      setSaved(true); setErr(""); setTimeout(() => setSaved(false), 2500);
    } catch (e) { setErr("Could not save: " + (e.message || "unknown error")); }
    setBusy(false);
  }
  function copyLink() { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div className="fade-in">
      <Header eyebrow="Your shareable page" title="My public profile" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>A parent spends about 15 seconds deciding whether to read on. Specific beats impressive — fill these the way we practised. Anything you leave blank simply won't show.</p>
      {(() => {
        const status = profile.profile_admin_status || "auto";
        const certified = !!profile.certificate_code;
        let msg, tone;
        if (status === "restricted") { msg = "Your public profile is currently on hold for review by SOWT. It won't be visible publicly until approved."; tone = C.red; }
        else if (status === "approved") { msg = "SOWT has approved your profile. Once you switch it public below, your link is live."; tone = C.green; }
        else if (certified) { msg = "You're SOWT Certified — switch your profile public below and your link goes live."; tone = C.green; }
        else { msg = "Your public page goes live once you've earned your SOWT certificate (or SOWT approves it early). You can build and preview it now."; tone = C.blue; }
        return <div className="mt-3 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: tone === C.red ? "#FDECEC" : tone === C.green ? "#E6F5EE" : "#EEF0FE", color: tone }}>{msg}</div>;
      })()}

      <div className="mt-6 rounded-3xl p-5 space-y-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {/* 1. Photo */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden grid place-items-center shrink-0" style={{ background: C.blue }}>
            {photo ? <img src={photo} alt="portrait" className="h-full w-full object-cover" /> : <span className="text-xl font-black text-white">{initials}</span>}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />
            <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading} className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.ink }}>{uploading ? <Spinner /> : <Camera size={15} />}{uploading ? "Uploading…" : (photo ? "Change photo" : "Upload photo")}</button>
            <div className="mt-1 text-xs" style={{ color: C.muted }}>Face visible, plain background, good light, smiling. Not a party photo or a logo.</div>
          </div>
        </div>
        {err && <div className="text-xs font-bold" style={{ color: C.red }}>{err}</div>}

        {/* 2. Headline */}
        <Field label="Headline — one specific line" hint='Be specific. e.g. "AQA GCSE Maths tutor — Years 10 & 11, foundation & higher" (not "Experienced tutor").'>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="AQA GCSE Maths tutor — Years 10 & 11, foundation & higher" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
        </Field>
        {/* 3. First sentence */}
        <Field label="First sentence — who you help & what changes" hint="Not where you studied — that comes later.">
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I help GCSE students who've lost confidence in Maths turn 'I can't do this' into steady, exam-ready progress." className="mt-1 w-full resize-none rounded-2xl px-4 py-3 text-sm" style={inp} />
        </Field>
        {/* 4. Proof */}
        <Field label="Proof — a result, a score, a number" hint='A number beats any adjective. e.g. "My last three students each moved up a grade in a term."'>
          <textarea rows={2} value={proof} onChange={(e) => setProof(e.target.value)} placeholder="My last three students each moved up a grade in a term." className="mt-1 w-full resize-none rounded-2xl px-4 py-3 text-sm" style={inp} />
        </Field>
        {/* subjects (supporting but shown) */}
        <Field label="Subjects & levels you teach"><input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths & English (Primary–GCSE), IELTS" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
        {/* 5. What happens next */}
        <Field label="What happens next — how to start" hint="Tell them exactly what to do. A parent who has to work it out won't.">
          <input value={getStarted} onChange={(e) => setGetStarted(e.target.value)} placeholder="Message me on WhatsApp for a free 15-minute intro call." className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
        </Field>
        <Field label="WhatsApp number (with country code)" hint='Shown as a "Message on WhatsApp" button.'><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. +234 801 234 5678" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>

        {/* Optional / supporting */}
        <button onClick={() => setMore((v) => !v)} className="btn flex items-center gap-2 text-sm font-bold" style={{ color: C.blue }}>{more ? <ChevronUp size={16} /> : <ChevronDown size={16} />} More details (optional)</button>
        {more && (
          <div className="space-y-4 pt-1">
            <Field label="Qualifications" hint="Degrees, teaching certificates, training."><input value={quals} onChange={(e) => setQuals(e.target.value)} placeholder="e.g. B.Ed, TEFL, SOWT Certified" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
            <Field label="Experience"><input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5+ years · 40+ students taught" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
            <Field label="Availability"><input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="e.g. Weekday evenings & weekends (WAT/GMT)" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
            <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria · Online" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
            <Field label="Short intro video link" hint="A 60-second Loom or YouTube link, if you have one."><input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-2xl px-4 py-3 text-sm" style={inp} /></Field>
          </div>
        )}

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
