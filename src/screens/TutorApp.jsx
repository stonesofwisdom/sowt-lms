import React, { useEffect, useState } from "react";
import Shell from "./Shell.jsx";
import { Header, Loading, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchCourse, fetchMySubs, submitAnswer, fetchMyAttendance, updateProfile, fetchAnnouncements, fetchResources } from "../db";
import Community from "./Community.jsx";
import Schedule from "./Schedule.jsx";
import AIStudio from "./AIStudio.jsx";
import Certificate from "./Certificate.jsx";
import PreCourseForm from "./PreCourseForm.jsx";
import ResourcesView from "./ResourcesView.jsx";
import { ai, feedbackPrompt } from "../ai";
import { Home as HomeIcon, BookOpen, ClipboardCheck, MessageSquare, Play, Lock, Sparkles, ArrowLeft, Megaphone, Check, CheckCircle2, Circle, Target, Calendar, Bot, Award, FileText, FolderOpen } from "lucide-react";

export default function TutorApp({ profile, onSignOut }) {
  const [formDone, setFormDone] = useState(!!profile.form_done);
  async function finishForm() { setFormDone(true); try { await updateProfile(profile.id, { form_done: true }); } catch (e) {} }
  const [tab, setTab] = useState("home");
  const [sessions, setSessions] = useState([]);
  const [subs, setSubs] = useState({});
  const [attended, setAttended] = useState([]);
  const [latestAnn, setLatestAnn] = useState(null);
  const [latestRes, setLatestRes] = useState(null);
  const seenAnn = localStorage.getItem("seenAnn_" + profile.id) || "";
  const seenRes = localStorage.getItem("seenRes_" + profile.id) || "";
  const hasNewAnn = latestAnn && latestAnn > seenAnn;
  const hasNewRes = latestRes && latestRes > seenRes;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [course, mine, att, anns, ress] = await Promise.all([fetchCourse(), fetchMySubs(profile.id), fetchMyAttendance(profile.id), fetchAnnouncements(), fetchResources()]);
    setSessions(course);
    const map = {}; mine.forEach((s) => (map[s.assignment_id] = s)); setSubs(map);
    setAttended(att);
    setLatestAnn(anns[0]?.created_at || null);
    setLatestRes(ress.reduce((m, r) => (r.created_at > m ? r.created_at : m), ""));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const total = sessions.length;
  const completed = sessions.filter((s) => s.assignments.length > 0 && s.assignments.every((a) => subs[a.id])).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const nav = [
    { id: "form", label: "Pre-Course Form", icon: FileText, dot: !formDone },
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "modules", label: "Modules", icon: BookOpen },
    { id: "studio", label: "AI Studio", icon: Bot },
    { id: "assignments", label: "Assignments", icon: ClipboardCheck },
    { id: "community", label: "Community", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "certificate", label: "Certificate", icon: Award },
  ];
  function markSeen(t) { if (t === "community" && latestAnn) localStorage.setItem("seenAnn_" + profile.id, latestAnn); if (t === "resources" && latestRes) localStorage.setItem("seenRes_" + profile.id, latestRes); }

  async function onSubmit(a, text) {
    const fb = await ai(feedbackPrompt(a.title, a.prompt, text));
    const row = await submitAnswer(a.id, profile.id, text, fb);
    setSubs((m) => ({ ...m, [a.id]: row }));
    return fb;
  }

  return (
    <Shell roleLabel="Tutor" roleColor={C.blue} nav={nav} tab={tab} setTab={(t) => { markSeen(t); setTab(t); setLesson(null); }} profile={profile} onSignOut={onSignOut}>
      {loading ? <Loading /> : (<>
        {tab === "form" && <PreCourseForm done={formDone} onDone={finishForm} />}
        {tab === "home" && <TutorHome profile={profile} pct={pct} completed={completed} total={total} next={sessions.find((s) => !s.assignments.every((a) => subs[a.id]))} setTab={setTab} />}
        {tab === "modules" && !lesson && <Modules sessions={sessions} subs={subs} open={setLesson} />}
        {tab === "modules" && lesson && <Lesson session={sessions.find((s) => s.id === lesson)} subs={subs} onBack={() => setLesson(null)} onSubmit={onSubmit} />}
        {tab === "schedule" && <Schedule sessions={sessions} subs={subs} open={(id) => { setTab("modules"); setLesson(id); }} />}
        {tab === "studio" && <AIStudio sessions={sessions} />}
        {tab === "assignments" && <TutorAssignments sessions={sessions} subs={subs} open={(id) => { setTab("modules"); setLesson(id); }} />}
        {tab === "community" && <Community profile={profile} canAnnounce={false} />}
        {tab === "resources" && <ResourcesView />}
        {tab === "certificate" && <Certificate profile={profile} total={sessions.length} completed={completed} attended={attended.length} />}
        {tab === "form" && <PreCourseForm done={formDone} onDone={finishForm} />}
        {tab === "resources" && <ResourcesView />}
      </>)}
    </Shell>
  );
}

function TutorHome({ profile, pct, completed, total, next, setTab }) {
  const first = String(profile.full_name || "there").split(" ")[0];
  return (
    <div className="fade-in space-y-4">
      <div className="rounded-3xl p-7 md:p-8 flex flex-col sm:flex-row sm:items-center gap-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.blue }}>Get Paid to Teach Online · Masterclass</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back, {first} 👋</h1>
          <p className="mt-2 text-sm max-w-lg" style={{ color: C.muted }}>10 live sessions, 16 topics, and a Certificate of Completion — all in one place.</p>
          <button onClick={() => setTab("modules")} className="btn mt-5 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.blue }}>Continue learning</button>
        </div>
        <div className="shrink-0 self-start grid place-items-center rounded-3xl px-6 py-4" style={{ background: "#EEF0FE" }}>
          <div className="text-3xl font-extrabold" style={{ color: C.blue }}>{pct}%</div>
          <div className="mt-1 text-xs font-semibold" style={{ color: C.muted }}>{completed} of {total} done</div>
        </div>
      </div>
      {next && (
        <div className="rounded-3xl p-6 text-white" style={{ background: C.blue }}>
          <div className="text-sm font-bold uppercase tracking-wide">Next up</div>
          <div className="mt-2 text-lg font-extrabold">{next.week} · {next.title}</div>
          <div className="mt-1 text-white/80 text-sm">{next.session_date ? `${next.session_date} · ` : ""}{next.session_time || "7:00 PM WAT"} · Zoom</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isSessionToday(next.session_date) && next.is_open && next.live_class_url && (
              <a href={next.live_class_url} target="_blank" rel="noreferrer" className="btn rounded-2xl px-4 py-2 text-sm font-black" style={{ background: C.yellow, color: C.ink }}>Join live class now</a>
            )}
            <button onClick={() => setTab("modules")} className="btn rounded-2xl px-4 py-2 text-sm font-bold" style={{ background: "#fff", color: C.blue }}>Go to modules</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Modules({ sessions, subs, open }) {
  const weeks = [...new Set(sessions.map((s) => s.week))];
  const WC = [C.blue, C.red, C.purple, C.green, C.orange];
  return (
    <div className="fade-in">
      <Header eyebrow="Course content" title="Modules & recordings" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>Locked sessions open after their live class. You can still preview what's coming.</p>
      <div className="mt-8 space-y-8">
        {weeks.map((wk, wi) => { const col = WC[wi % WC.length]; return (
          <div key={wk}>
            <div className="mb-3"><span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white" style={{ background: col }}>{wk}</span></div>
            <div className="space-y-2">
              {sessions.filter((s) => s.week === wk).map((s) => {
                const done = s.assignments.length > 0 && s.assignments.every((a) => subs[a.id]);
                const locked = !s.is_open;
                const Tag = locked ? "div" : "button";
                return (
                  <Tag key={s.id} onClick={locked ? undefined : () => open(s.id)} className={(locked ? "" : "lift ") + "w-full flex items-center gap-4 rounded-2xl p-4 text-left"} style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${locked ? "#D7D2C4" : col}`, opacity: locked ? 0.85 : 1, cursor: locked ? "default" : "pointer" }}>
                    <span>{locked ? <Lock size={24} color="#B9B4A5" /> : done ? <CheckCircle2 size={26} color={col} /> : <Circle size={26} color="#CFCABA" />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>Session {s.sort}{locked ? " · Locked" : ""}</span><span className="block font-bold leading-snug">{s.title}</span></span>
                    <span className="ml-auto text-xs font-bold" style={{ color: locked ? C.muted : col }}>{locked ? "Opens after live class" : "Open"}</span>
                  </Tag>
                );
              })}
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}

function isSessionToday(dateStr) {
  if (!dateStr) return false;
  const t = new Date();
  const y = t.getFullYear(); const m = String(t.getMonth() + 1).padStart(2, "0"); const d = String(t.getDate()).padStart(2, "0");
  const iso = `${y}-${m}-${d}`;
  const s = String(dateStr).trim();
  // Try ISO first
  if (s === iso) return true;
  // Try parsing common formats
  const parsed = new Date(s);
  if (!isNaN(parsed)) {
    return parsed.getFullYear() === t.getFullYear() && parsed.getMonth() === t.getMonth() && parsed.getDate() === t.getDate();
  }
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = s.replace(/[-.]/g, "/").split("/");
  if (parts.length === 3) {
    const [a, b, c] = parts.map((x) => parseInt(x, 10));
    // assume day/month/year
    if (a === t.getDate() && b === t.getMonth() + 1 && (c === t.getFullYear() || c === t.getFullYear() % 100)) return true;
  }
  return false;
}

function Lesson({ session, subs, onBack, onSubmit }) {
  if (!session) return null;
  const liveToday = isSessionToday(session.session_date) && session.is_open && session.live_class_url;
  const moduleLocked = !session.is_open;
  const assignmentsLocked = !session.is_open || !session.assignments_active;
  return (
    <div className="fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: C.muted }}><ArrowLeft size={16} /> All modules</button>
      <div className="mt-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>{session.week} · {session.theme}</div>
      <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight">{session.title}</h1>
      {session.facilitator && <div className="mt-2 text-sm font-semibold" style={{ color: C.blue }}>Facilitated by {session.facilitator}</div>}
      {liveToday && (
        <a href={session.live_class_url} target="_blank" rel="noreferrer" className="btn mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white" style={{ background: C.red }}>
          <span className="grid place-items-center h-2 w-2 rounded-full" style={{ background: "#fff" }} />
          Join live class now
        </a>
      )}

      <div className="mt-6 rounded-3xl overflow-hidden grid place-items-center text-center p-8" style={{ background: C.ink, aspectRatio: "16 / 9" }}>
        {moduleLocked ? (
          <div className="text-white/70"><Lock size={30} className="mx-auto" /><div className="mt-2 text-sm font-semibold">Recording locked</div><div className="text-xs text-white/40">Available after the live session</div></div>
        ) : session.recording_url ? (
          <div className="flex flex-col items-center gap-3"><a href={session.recording_url} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold" style={{ background: C.yellow, color: C.ink }}><Play size={18} /> Watch recording</a>{session.recording_passcode && <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-white/90" style={{ background: "rgba(255,255,255,.1)" }}>Passcode: <span className="font-mono">{session.recording_passcode}</span><button onClick={() => { navigator.clipboard.writeText(session.recording_passcode); }} className="underline">copy</button></div>}</div>
        ) : (
          <div className="text-white/70"><Play size={28} className="mx-auto" /><div className="mt-2 text-sm">Recording link coming soon</div></div>
        )}
      </div>

      {session.description && <p className="mt-6 text-[15px] leading-relaxed">{session.description}</p>}

      {session.objectives?.length > 0 && (
        <div className="mt-6 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: C.blue }}><Target size={15} /> What you'll be able to do</div>
          <ul className="mt-3 space-y-2">{session.objectives.map((o, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 size={17} color={C.blue} className="mt-0.5 shrink-0" /><span>{o}</span></li>)}</ul>
        </div>
      )}

      <div className="mt-4 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}><ClipboardCheck size={15} /> Assignments</div>
        {assignmentsLocked ? (
          <div className="mt-3 rounded-2xl p-4 flex items-start gap-3 text-sm" style={{ background: C.bg, border: `1px dashed ${C.line}`, color: C.muted }}><Lock size={18} className="mt-0.5 shrink-0" /><span>{moduleLocked ? "Unlocks when this module opens." : "Unlocks after the live class is held."}</span></div>
        ) : session.assignments.length === 0 ? (
          <div className="mt-3 text-sm" style={{ color: C.muted }}>No assignments set for this session yet.</div>
        ) : (
          <div className="mt-3 space-y-3">{session.assignments.map((a) => <AssignmentBlock key={a.id} a={a} existing={subs[a.id]} onSubmit={onSubmit} />)}</div>
        )}
      </div>
    </div>
  );
}

function AssignmentBlock({ a, existing, onSubmit }) {
  const [text, setText] = useState(existing?.content || "");
  const [fb, setFb] = useState(existing?.feedback || "");
  const [busy, setBusy] = useState(false);
  const submitted = !!existing;
  async function go() {
    if (!text.trim() || busy) return; setBusy(true); setFb("");
    try { const r = await onSubmit(a, text); setFb(r); } finally { setBusy(false); }
  }
  return (
    <div className="rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2">
        <span className="grid place-items-center h-7 w-7 rounded-lg shrink-0" style={{ background: submitted ? C.blue : C.yellow }}>{submitted ? <Check size={15} color="#fff" /> : <ClipboardCheck size={14} color={C.ink} />}</span>
        <div className="font-black text-sm">{a.title}</div>
        {submitted && <span className="ml-auto text-[11px] font-bold" style={{ color: C.blue }}>Submitted</span>}
      </div>
      <p className="mt-2 text-sm" style={{ color: C.muted }}>{a.prompt}</p>
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer…" className="mt-2 w-full resize-none rounded-xl px-3 py-2 text-sm" style={{ background: C.card, border: `1px solid ${C.line}` }} />
      <button onClick={go} disabled={busy || !text.trim()} className="btn mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.ink, opacity: busy || !text.trim() ? 0.55 : 1 }}>{busy ? <Spinner light /> : <Sparkles size={15} color={C.yellow} />}{busy ? "Reviewing…" : submitted ? "Resubmit" : "Submit for feedback"}</button>
      {fb && <div className="fade-in mt-3 rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "#FFF9DC", border: `1px solid ${C.yellow}` }}><div className="mb-1 text-xs font-bold uppercase" style={{ color: C.red }}>AI feedback</div>{fb}</div>}
    </div>
  );
}

function TutorAssignments({ sessions, subs, open }) {
  const rows = [];
  sessions.forEach((s) => s.assignments.forEach((a) => rows.push({ s, a })));
  return (
    <div className="fade-in">
      <Header eyebrow="Track your work" title="Assignments" />
      <div className="mt-8 space-y-3">
        {rows.length === 0 && <div className="text-sm" style={{ color: C.muted }}>No assignments yet.</div>}
        {rows.map(({ s, a }) => { const done = !!subs[a.id]; const moduleLocked = !s.is_open; const locked = !s.is_open || !s.assignments_active; const Tag = moduleLocked ? "div" : "button"; return (
          <Tag key={a.id} onClick={moduleLocked ? undefined : () => open(s.id)} className={(moduleLocked ? "" : "lift ") + "w-full flex items-center gap-4 rounded-2xl p-4 text-left"} style={{ background: C.card, border: `1px solid ${C.line}`, cursor: moduleLocked ? "default" : "pointer" }}>
            <span className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: done ? C.blue : locked ? "#EDEAE0" : C.yellow }}>{done ? <Check size={18} color="#fff" /> : locked ? <Lock size={15} color="#9A947F" /> : <ClipboardCheck size={18} color={C.ink} />}</span>
            <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>Session {s.sort}</span><span className="block font-bold leading-snug">{locked && !done ? "Locked" : a.title}</span></span>
            <span className="ml-auto text-xs font-bold" style={{ color: done ? C.blue : locked ? C.muted : C.red }}>{done ? "Submitted" : locked ? "Locked" : "To do"}</span>
          </Tag>
        ); })}
      </div>
    </div>
  );
}

export function AnnouncementsList({ ann }) {
  return (
    <div className="fade-in">
      <Header eyebrow="Stay in the loop" title="Announcements" />
      <div className="mt-8 space-y-3">
        {ann.length === 0 && <div className="text-sm" style={{ color: C.muted }}>No announcements yet.</div>}
        {ann.map((a) => (
          <div key={a.id} className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2"><Megaphone size={16} color={C.purple} /><div className="font-black">{a.title}</div></div>
            <p className="mt-2 text-sm">{a.body}</p>
            <div className="mt-2 text-xs" style={{ color: C.muted }}>{a.author_name} · {a.author_role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
