import React, { useEffect, useState } from "react";
import Shell from "./Shell.jsx";
import { Header, Loading, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchCourse, saveSession, fetchAllSubs, updateSubmission, fetchTutors, fetchSessionAttendance, setAttendance, fetchAnnouncements, fetchResources } from "../db";
import Community from "./Community.jsx";
import AIStudio from "./AIStudio.jsx";
import Schedule from "./Schedule.jsx";
import ResourcesView from "./ResourcesView.jsx";
import { ai, feedbackPrompt } from "../ai";
import { BookOpen, ClipboardCheck, MessageSquare, Lock, Unlock, Check, ArrowLeft, Sparkles, CheckCircle2, Circle, Calendar, Bot, FolderOpen , FileText, Image as ImageIcon, Paperclip } from "lucide-react";

export default function FacilitatorApp({ profile, onSignOut }) {
  const [tab, setTab] = useState("sessions");
  const [sessions, setSessions] = useState([]);
  useEffect(() => { fetchCourse().then(setSessions); }, []);
  const nav = [
    { id: "sessions", label: "My sessions", icon: BookOpen },
    { id: "subs", label: "Submissions", icon: ClipboardCheck },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "studio", label: "AI Studio", icon: Bot },
    { id: "announcements", label: "Community", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: FolderOpen },
  ];
  function markSeen() {}
  return (
    <Shell roleLabel="Facilitator" roleColor={C.purple} nav={nav} tab={tab} setTab={(t) => { markSeen(t); setTab(t); }} profile={profile} onSignOut={onSignOut}>
      {tab === "sessions" && <MySessions me={profile.full_name} />}
      {tab === "subs" && <Submissions me={profile.full_name} />}
      {tab === "schedule" && <Schedule sessions={sessions} subs={{}} open={() => {}} />}
      {tab === "studio" && <AIStudio sessions={sessions} />}
      {tab === "announcements" && <Community profile={profile} canAnnounce={true} />}
      {tab === "resources" && <ResourcesView />}
    </Shell>
  );
}

function MySessions({ me }) {
  const [sessions, setSessions] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [att, setAtt] = useState({});
  async function load() {
    const all = await fetchCourse();
    const mine = all.filter((s) => s.facilitator === me);
    setSessions(mine);
    const ts = await fetchTutors(); setTutors(ts);
    const map = {};
    for (const s of mine) { const rows = await fetchSessionAttendance(s.id); rows.forEach((r) => { map[s.id + ":" + r.tutor_id] = r.present; }); }
    setAtt(map);
  }
  useEffect(() => { load(); }, []);
  async function toggle(s, field) {
    const patch = { [field]: !s[field] };
    if (field === "is_open" && s.is_open) patch.assignments_active = false;
    if (field === "assignments_active" && !s.assignments_active) patch.is_open = true;
    setSessions((ss) => ss.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
    await saveSession({ ...s, ...patch });
  }
  async function mark(sid, tid) {
    const key = sid + ":" + tid; const now = !att[key];
    setAtt((m) => ({ ...m, [key]: now }));
    await setAttendance(sid, tid, now);
  }
  if (!sessions) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow={"Facilitator \u00b7 " + me} title="My sessions" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>After you teach live, open the module, activate assignments, and tick who attended.</p>
      <div className="mt-8 space-y-4">
        {sessions.length === 0 && <div className="rounded-3xl p-8 text-center text-sm" style={{ background: C.card, border: "1px solid " + C.line, color: C.muted }}>No sessions assigned to you yet. (An admin sets the facilitator on each session.)</div>}
        {sessions.map((s) => { const attCount = tutors.filter((t) => att[s.id + ":" + t.id]).length; return (
          <div key={s.id} className="rounded-3xl p-5" style={{ background: C.card, border: "1px solid " + C.line }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{s.week} \u00b7 {s.session_date}</div>
            <div className="mt-1 font-black text-lg leading-snug">{s.title}</div>
            {s.activity && <div className="mt-3 rounded-2xl p-3 text-sm" style={{ background: "#EEF0FE", border: "1px solid " + C.blue }}><span className="font-bold" style={{ color: C.blue }}>In the live session: </span>{s.activity}</div>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => toggle(s, "is_open")} className="btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={s.is_open ? { background: "#E6F5EE", color: C.green } : { background: "#FDECEC", color: C.red }}>{s.is_open ? <><Unlock size={13} /> Module open</> : <><Lock size={13} /> Module locked</>}</button>
              <button onClick={() => toggle(s, "assignments_active")} className="btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={s.assignments_active ? { background: "#E6F5EE", color: C.green } : { background: C.bg, color: C.muted, border: "1px solid " + C.line }}>{s.assignments_active ? <><Unlock size={13} /> Assignments active</> : <><Lock size={13} /> Assignments locked</>}</button>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: C.muted }}>Attendance ({attCount}/{tutors.length})</div>
              <div className="flex flex-wrap gap-2">
                {tutors.map((t) => { const on = att[s.id + ":" + t.id]; return (
                  <button key={t.id} onClick={() => mark(s.id, t.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={on ? { background: "#E6F5EE", color: C.green } : { background: C.bg, color: C.muted, border: "1px solid " + C.line }}>{on ? <CheckCircle2 size={13} /> : <Circle size={13} />}{(t.full_name || t.email).split(" ")[0]}</button>
                ); })}
                {tutors.length === 0 && <span className="text-xs" style={{ color: C.muted }}>No enrolled tutors yet.</span>}
              </div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
function Submissions({ me }) {
  const [subs, setSubs] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false);
  async function load() {
    const all = await fetchAllSubs();
    setSubs(all.filter((x) => x.assignments?.sessions?.facilitator === me));
  }
  useEffect(() => { load(); }, []);
  const sub = subs?.find((x) => x.id === openId);
  async function suggest() {
    if (!sub || busy) return; setBusy(true);
    const fb = await ai(feedbackPrompt(sub.assignments?.title || "", sub.assignments?.prompt || "", sub.content || ""));
    setDraft(fb); setBusy(false);
  }
  async function send() {
    await updateSubmission(sub.id, { feedback: draft, status: "reviewed" });
    setOpenId(null); setDraft(""); load();
  }
  if (!subs) return <Loading />;
  if (sub) return (
    <div className="fade-in">
      <button onClick={() => { setOpenId(null); setDraft(""); }} className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: C.muted }}><ArrowLeft size={16} /> All submissions</button>
      <div className="mt-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>{sub.assignments?.sessions?.title}</div>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{sub.profiles?.full_name || sub.profiles?.email}</h1>
      <div className="mt-4 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="text-xs font-bold uppercase" style={{ color: C.muted }}>{sub.assignments?.title}</div>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>{sub.assignments?.prompt}</p>
        {sub.content && <div className="mt-3 rounded-2xl p-4 text-sm leading-relaxed" style={{ background: C.bg, border: `1px solid ${C.line}` }}>{sub.content}</div>}
        {sub.file_url && (
          <div className="mt-3">
            <div className="text-xs font-bold uppercase mb-1" style={{ color: C.muted }}>Attached file</div>
            {/\.(png|jpe?g|gif|webp)$/i.test(sub.file_name || sub.file_url)
              ? <a href={sub.file_url} target="_blank" rel="noreferrer"><img src={sub.file_url} alt={sub.file_name || "submission"} className="rounded-2xl max-h-96 w-auto" style={{ border: `1px solid ${C.line}` }} /></a>
              : <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.blue }}><FileText size={16} color={C.red} /> {sub.file_name || "Open PDF"}</a>}
          </div>
        )}
      </div>
      <div className="mt-4 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs font-bold uppercase" style={{ color: C.red }}>Your feedback</div>
          <button onClick={suggest} disabled={busy} className="btn inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: C.ink }}>{busy ? <Spinner light /> : <Sparkles size={14} color={C.yellow} />} Suggest with AI</button>
        </div>
        <textarea rows={5} value={draft || sub.feedback || ""} onChange={(e) => setDraft(e.target.value)} placeholder="Write feedback, or let AI draft it." className="mt-3 w-full resize-none rounded-2xl px-4 py-3 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
        <button onClick={send} className="btn mt-3 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.green }}><Check size={16} /> Send feedback & mark reviewed</button>
      </div>
    </div>
  );
  return (
    <div className="fade-in">
      <Header eyebrow="Review tutor work" title="Submissions" />
      <div className="mt-8 space-y-3">
        {subs.length === 0 && <div className="rounded-3xl p-8 text-center text-sm" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted }}>No submissions for your sessions yet.</div>}
        {subs.map((x) => { const isNew = x.status !== "reviewed"; return (
          <button key={x.id} onClick={() => { setOpenId(x.id); setDraft(x.feedback || ""); }} className="lift w-full flex items-center gap-4 rounded-2xl p-4 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full text-xs font-black text-white" style={{ background: C.blue }}>{(x.profiles?.full_name || x.profiles?.email || "T").split(" ").map((y) => y[0]).slice(0, 2).join("")}</span>
            <span className="min-w-0 flex-1"><span className="block font-bold truncate">{x.profiles?.full_name || x.profiles?.email}</span><span className="block text-xs truncate" style={{ color: C.muted }}>{x.assignments?.sessions?.title}</span></span>
            <span className="ml-auto text-[11px] font-bold rounded-full px-2.5 py-1" style={isNew ? { background: "#FDECEC", color: C.red } : { background: "#E6F5EE", color: C.green }}>{isNew ? "New" : "Reviewed"}</span>
          </button>
        ); })}
      </div>
    </div>
  );
}
