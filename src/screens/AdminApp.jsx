import React, { useEffect, useState } from "react";
import Shell from "./Shell.jsx";
import { Header, Loading, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchProfiles, updateProfile, fetchCourse, saveSession, addSession, deleteSession, addAssignment, saveAssignment, deleteAssignment, fetchAnnouncements, postAnnouncement, fetchFacilitators, setSort, fetchResources, addResource, saveResource, deleteResource, fetchQuizzes, addQuiz, saveQuiz, deleteQuiz, addQuizQuestion, saveQuizQuestion, deleteQuizQuestion, fetchAllSubmissions, fetchAllAttempts, fetchAllAttendance, updateSubmission } from "../db";
import { AnnouncementsList } from "./TutorApp.jsx";
import Community from "./Community.jsx";
import { ai, feedbackPrompt } from "../ai";
import { Users, BookOpen, Megaphone, Check, X, Plus, Trash2, Lock, Unlock, Search, ChevronUp, ChevronDown, FolderOpen, ClipboardCheck, FileText, ArrowLeft, Sparkles } from "lucide-react";

export default function AdminApp({ profile, onSignOut }) {
  const [tab, setTab] = useState("members");
  const nav = [
    { id: "members", label: "Members", icon: Users },
    { id: "content", label: "Course content", icon: BookOpen },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "subs", label: "Submissions", icon: ClipboardCheck },
    { id: "announcements", label: "Community", icon: Megaphone },
  ];
  return (
    <Shell roleLabel="Admin" roleColor={C.red} nav={nav} tab={tab} setTab={setTab} profile={profile} onSignOut={onSignOut}>
      {tab === "members" && <Members />}
      {tab === "progress" && <Progress />}
      {tab === "content" && <Content />}
      {tab === "resources" && <AdminResources />}
      {tab === "resources" && <AdminResources />}
      {tab === "subs" && <AdminSubmissions />}
      {tab === "announcements" && <Community profile={profile} canAnnounce={true} />}
    </Shell>
  );
}

function Members() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  async function load() { setRows(await fetchProfiles()); }
  useEffect(() => { load(); }, []);
  async function set(id, patch) { await updateProfile(id, patch); load(); }
  if (!rows) return <Loading />;
  const shown = rows.filter((r) => (r.full_name || "").toLowerCase().includes(q.toLowerCase()) || (r.email || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fade-in">
      <Header eyebrow="Enrolment" title="Members" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>New sign-ups are pending until you enrol them. Set someone's role to give them the facilitator or admin console.</p>
      <div className="mt-6 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.muted} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-sm" style={{ background: C.card, border: `1px solid ${C.line}` }} /></div>
      <div className="mt-5 rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {shown.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="min-w-0 flex-1">
              <div className="font-bold truncate">{r.full_name || "(no name)"}</div>
              <div className="text-xs truncate" style={{ color: C.muted }}>{r.email}{r.whatsapp_number ? " · " + r.whatsapp_number : ""}</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={r.status === "enrolled" ? { background: "#E6F5EE", color: C.green } : { background: "#FDECEC", color: C.red }}>{r.status}</span>
            <select value={r.role} onChange={(e) => set(r.id, { role: e.target.value })} className="rounded-xl px-2 py-1.5 text-xs font-bold" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              {["tutor", "facilitator", "admin"].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            {r.status === "enrolled"
              ? <button onClick={() => set(r.id, { status: "revoked" })} className="btn inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: C.card, border: `1px solid ${C.line}` }}><X size={13} /> Revoke</button>
              : <button onClick={() => set(r.id, { status: "enrolled" })} className="btn inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: C.green }}><Check size={13} /> Enrol</button>}
            <button onClick={() => set(r.id, { certificate_unlocked: !r.certificate_unlocked })} className="btn inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold" style={r.certificate_unlocked ? { background: "#E6F5EE", color: C.green } : { background: C.bg, color: C.muted, border: `1px solid ${C.line}` }}>{r.certificate_unlocked ? "Cert unlocked" : "Unlock cert"}</button>
          </div>
        ))}
        {shown.length === 0 && <div className="px-5 py-8 text-center text-sm" style={{ color: C.muted }}>No members yet.</div>}
      </div>
    </div>
  );
}

function Content() {
  const [sessions, setSessions] = useState(null);
  const [facs, setFacs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [saving, setSaving] = useState(false);
  async function load() { setSessions(await fetchCourse()); setFacs(await fetchFacilitators()); setQuizzes(await fetchQuizzes()); }
  useEffect(() => { load(); }, []);
  const inp = { background: C.bg, border: `1px solid ${C.line}` };
  function edit(id, patch) { setSessions((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s))); }
  async function save(s) { setSaving(true); await saveSession(s); setSaving(false); }
  async function toggle(s, field) { const patch = { [field]: !s[field] }; if (field === "is_open" && s.is_open) patch.assignments_active = false; if (field === "assignments_active" && !s.assignments_active) patch.is_open = true; edit(s.id, patch); await saveSession({ ...s, ...patch }); }
  async function newSession() { const sort = (sessions?.length || 0) + 1; await addSession(sort); load(); }
  async function move(i, dir) { const j = i + dir; if (j < 0 || j >= sessions.length) return; const arr = [...sessions]; const t = arr[i]; arr[i] = arr[j]; arr[j] = t; const renum = arr.map((x, idx) => ({ ...x, sort: idx + 1 })); setSessions(renum); await Promise.all(renum.map((x) => setSort(x.id, x.sort))); }
  async function remove(id) { await deleteSession(id); load(); }
  async function newA(sid) { await addAssignment(sid); load(); }
  async function saveA(a) { await saveAssignment(a); }
  async function delA(id) { await deleteAssignment(id); load(); }
  function editA(sid, aid, patch) { setSessions((ss) => ss.map((s) => (s.id === sid ? { ...s, assignments: s.assignments.map((a) => (a.id === aid ? { ...a, ...patch } : a)) } : s))); }
  if (!sessions) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow="Manage" title="Course content" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>Edit sessions, paste each session's recording link, and control release. Objectives: one per line. Remember to Save each session after editing.</p>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Sessions ({sessions.length})</div>
        <button onClick={newSession} className="btn inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}><Plus size={15} /> Add session</button>
      </div>
      <datalist id="faclist">{["SOWT Faculty", ...facs].map((n) => <option key={n} value={n} />)}</datalist>
      <div className="mt-3 space-y-3">
        {sessions.map((s, i) => (
          <div key={s.id} className="rounded-3xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button onClick={() => toggle(s, "is_open")} className="btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={s.is_open ? { background: "#E6F5EE", color: C.green } : { background: "#FDECEC", color: C.red }}>{s.is_open ? <><Unlock size={13} /> Module open</> : <><Lock size={13} /> Module locked</>}</button>
              <button onClick={() => toggle(s, "assignments_active")} className="btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={s.assignments_active ? { background: "#E6F5EE", color: C.green } : { background: C.bg, color: C.muted, border: `1px solid ${C.line}` }}>{s.assignments_active ? <><Unlock size={13} /> Assignments active</> : <><Lock size={13} /> Assignments locked</>}</button>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => move(i, -1)} title="Move up"><ChevronUp size={18} color={C.muted} /></button>
                <button onClick={() => move(i, 1)} title="Move down"><ChevronDown size={18} color={C.muted} /></button>
                <button onClick={() => remove(s.id)} title="Delete"><Trash2 size={16} color={C.red} /></button>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                <input value={s.week || ""} onChange={(e) => edit(s.id, { week: e.target.value })} placeholder="Week" className="rounded-xl px-3 py-2 text-sm font-bold w-24" style={inp} />
                <input value={s.theme || ""} onChange={(e) => edit(s.id, { theme: e.target.value })} placeholder="Theme" className="rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px]" style={inp} />
                <input list="faclist" value={s.facilitator || ""} onChange={(e) => edit(s.id, { facilitator: e.target.value })} placeholder="Facilitator name" className="rounded-xl px-3 py-2 text-sm font-semibold min-w-[150px]" style={inp} />
                <input type="date" value={s.session_date || ""} onChange={(e) => edit(s.id, { session_date: e.target.value })} placeholder="YYYY-MM-DD" className="rounded-xl px-3 py-2 text-sm w-40" style={inp} />
                <input value={s.session_time || ""} onChange={(e) => edit(s.id, { session_time: e.target.value })} placeholder="Time (e.g. 7:00 PM WAT)" className="rounded-xl px-3 py-2 text-sm w-40" style={inp} />
                  <input value={s.session_time || ""} onChange={(e) => edit(s.id, { session_time: e.target.value })} placeholder="Time" className="rounded-xl px-3 py-2 text-sm w-32" style={inp} />
              </div>
              <input value={s.title || ""} onChange={(e) => edit(s.id, { title: e.target.value })} placeholder="Session title" className="rounded-xl px-3 py-2 text-sm font-bold" style={inp} />
              <input value={s.live_class_url || ""} onChange={(e) => edit(s.id, { live_class_url: e.target.value })} placeholder="Live class link (Zoom meeting URL) — shown to tutors on session day" className="rounded-xl px-3 py-2 text-sm" style={inp} />
              <input value={s.recording_url || ""} onChange={(e) => edit(s.id, { recording_url: e.target.value })} placeholder="Recording link (Zoom / YouTube / Drive URL) — shown after class" className="rounded-xl px-3 py-2 text-sm" style={inp} />
              <input value={s.recording_passcode || ""} onChange={(e) => edit(s.id, { recording_passcode: e.target.value })} placeholder="Recording passcode (leave blank if none)" className="rounded-xl px-3 py-2 text-sm" style={inp} />
              <textarea rows={2} value={s.description || ""} onChange={(e) => edit(s.id, { description: e.target.value })} placeholder="Description" className="resize-none rounded-xl px-3 py-2 text-sm" style={inp} />
              <textarea rows={3} value={(s.objectives || []).join("\n")} onChange={(e) => edit(s.id, { objectives: e.target.value.split("\n").filter((x) => x.trim()) })} placeholder="Objectives (one per line)" className="resize-none rounded-xl px-3 py-2 text-sm" style={inp} />
              <textarea rows={2} value={s.activity || ""} onChange={(e) => edit(s.id, { activity: e.target.value })} placeholder="In-session activity" className="resize-none rounded-xl px-3 py-2 text-sm" style={inp} />
              <div className="rounded-xl p-3" style={{ background: C.bg }}>
                <div className="flex items-center justify-between mb-2"><div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.red }}>Written assignments ({s.assignments.length})</div><button onClick={() => newA(s.id)} className="btn inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: C.blue }}><Plus size={12} /> Add</button></div>
                <div className="space-y-2">
                  {s.assignments.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 rounded-lg p-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                      <div className="flex-1 space-y-1.5">
                        <input value={a.title} onChange={(e) => editA(s.id, a.id, { title: e.target.value })} onBlur={() => saveA(a)} className="w-full rounded-lg px-2.5 py-1.5 text-sm font-bold" style={inp} placeholder="Assignment title" />
                        <textarea rows={2} value={a.prompt} onChange={(e) => editA(s.id, a.id, { prompt: e.target.value })} onBlur={() => saveA(a)} className="w-full resize-none rounded-lg px-2.5 py-1.5 text-sm" style={inp} placeholder="Task prompt" />
                      </div>
                      <button onClick={() => delA(a.id)} className="pt-1"><Trash2 size={14} color={C.red} /></button>
                    </div>
                  ))}
                  {s.assignments.length === 0 && <div className="text-xs" style={{ color: C.muted }}>No assignments yet.</div>}
                </div>
              </div>
              <QuizBox sessionId={s.id} quizzes={quizzes} reload={load} />
              <button onClick={() => save(s)} className="btn inline-flex w-max items-center gap-2 rounded-2xl px-5 py-2 text-sm font-bold text-white" style={{ background: C.ink }}>{saving ? <Spinner light /> : <Check size={15} />} Save session</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAnnouncements({ profile }) {
  const [ann, setAnn] = useState(null);
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [busy, setBusy] = useState(false);
  async function load() { setAnn(await fetchAnnouncements()); }
  useEffect(() => { load(); }, []);
  async function post() {
    if (!title.trim() || !body.trim()) return; setBusy(true);
    await postAnnouncement({ author_name: profile.full_name || "Programme lead", author_role: "Programme lead", title: title.trim(), body: body.trim() });
    setTitle(""); setBody(""); setBusy(false); load();
  }
  if (!ann) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow="Broadcast" title="Announcements" />
      <div className="mt-6 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
        <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you want the cohort to know?" className="mt-2 w-full resize-none rounded-xl px-3 py-2 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
        <button onClick={post} disabled={busy} className="btn mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>{busy ? <Spinner light /> : <Megaphone size={15} />} Post</button>
      </div>
      <div className="mt-4"><AnnouncementsList ann={ann} /></div>
    </div>
  );
}

function AdminResources() {
  const [rows, setRows] = useState(null);
  async function load() { setRows(await fetchResources()); }
  useEffect(() => { load(); }, []);
  const inp = { background: C.bg, border: `1px solid ${C.line}` };
  function edit(id, patch) { setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))); }
  async function add() { await addResource(); load(); }
  async function save(r) { await saveResource(r); }
  async function del(id) { await deleteResource(id); load(); }
  if (!rows) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow="Curate" title="Resources" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>Add helpful links and materials for tutors and facilitators.</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Items ({rows.length})</div>
        <button onClick={add} className="btn inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}><Plus size={15} /> Add resource</button>
      </div>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-3xl p-4 space-y-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <input value={r.title} onChange={(e) => edit(r.id, { title: e.target.value })} onBlur={() => save(r)} placeholder="Title" className="w-full rounded-xl px-3 py-2 text-sm font-bold" style={inp} />
            <input value={r.url} onChange={(e) => edit(r.id, { url: e.target.value })} onBlur={() => save(r)} placeholder="https://..." className="w-full rounded-xl px-3 py-2 text-sm" style={inp} />
            <textarea rows={2} value={r.description || ""} onChange={(e) => edit(r.id, { description: e.target.value })} onBlur={() => save(r)} placeholder="Short description" className="w-full resize-none rounded-xl px-3 py-2 text-sm" style={inp} />
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => del(r.id)}><Trash2 size={16} color={C.red} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm" style={{ color: C.muted }}>No resources yet.</div>}
      </div>
    </div>
  );
}


function QuizBox({ sessionId, quizzes, reload }) {
  const quiz = quizzes.find((q) => q.session_id === sessionId);
  async function create() { await addQuiz(sessionId); reload(); }
  async function remove() { if (!confirm("Delete this quiz and all its questions?")) return; await deleteQuiz(quiz.id); reload(); }
  const inp = { background: C.card, border: `1px solid ${C.line}` };
  if (!quiz) return (
    <div className="rounded-xl p-3" style={{ background: C.bg }}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.purple }}>MCQ Quiz</div>
        <button onClick={create} className="btn inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: C.purple }}><Plus size={12} /> Add quiz</button>
      </div>
      <div className="mt-1 text-xs" style={{ color: C.muted }}>Optional. Auto-marks at 70% pass mark. If this session has written assignments, those supersede the quiz.</div>
    </div>
  );
  return <QuizEditor quiz={quiz} onDelete={remove} reload={reload} />;
}

function QuizEditor({ quiz, onDelete, reload }) {
  const [title, setTitle] = useState(quiz.title);
  const [qs, setQs] = useState(quiz.questions || []);
  const inp = { background: C.card, border: `1px solid ${C.line}` };
  async function saveTitle() { await saveQuiz({ ...quiz, title }); }
  async function addQ(kind) { const q = await addQuizQuestion(quiz.id, kind, qs.length); setQs([...qs, q]); }
  function editQ(id, patch) { setQs((arr) => arr.map((q) => (q.id === id ? { ...q, ...patch } : q))); }
  async function saveQ(q) { await saveQuizQuestion(q); }
  async function delQ(id) { await deleteQuizQuestion(id); setQs((arr) => arr.filter((q) => q.id !== id)); }
  return (
    <div className="rounded-xl p-3" style={{ background: C.bg }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.purple }}>MCQ Quiz ({qs.length} question{qs.length === 1 ? "" : "s"} · pass at 70%)</div>
        <div className="flex items-center gap-1">
          <button onClick={() => addQ("mcq")} className="btn inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: C.purple }}><Plus size={12} /> MCQ</button>
          <button onClick={() => addQ("tf")} className="btn inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: C.blue }}><Plus size={12} /> T/F</button>
          <button onClick={onDelete}><Trash2 size={14} color={C.red} /></button>
        </div>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} placeholder="Quiz title" className="w-full rounded-lg px-2.5 py-1.5 text-sm font-bold" style={inp} />
      <div className="mt-2 space-y-2">
        {qs.map((q, qi) => (
          <div key={q.id} className="rounded-lg p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold" style={{ color: C.muted }}>{qi + 1}.</span>
              <textarea rows={2} value={q.question} onChange={(e) => editQ(q.id, { question: e.target.value })} onBlur={() => saveQ(q)} placeholder="Question" className="flex-1 resize-none rounded-lg px-2 py-1.5 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
              <button onClick={() => delQ(q.id)}><Trash2 size={13} color={C.red} /></button>
            </div>
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button onClick={() => { editQ(q.id, { correct: oi }); saveQ({ ...q, correct: oi }); }} title="Mark as correct answer" className="grid place-items-center h-6 w-6 rounded-full shrink-0" style={{ background: q.correct === oi ? C.green : C.bg, border: `2px solid ${q.correct === oi ? C.green : C.line}` }}>{q.correct === oi && <Check size={12} color="#fff" />}</button>
                  {q.kind === "tf" ? (
                    <div className="flex-1 text-sm font-semibold px-2 py-1">{opt}</div>
                  ) : (
                    <>
                      <input value={opt} onChange={(e) => { const options = [...q.options]; options[oi] = e.target.value; editQ(q.id, { options }); }} onBlur={() => saveQ(q)} className="flex-1 rounded-lg px-2 py-1 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} placeholder={"Option " + String.fromCharCode(65 + oi)} />
                      {q.options.length > 2 && <button onClick={() => { const options = q.options.filter((_, i) => i !== oi); const correct = q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct; editQ(q.id, { options, correct }); saveQ({ ...q, options, correct }); }}><X size={13} color={C.muted} /></button>}
                    </>
                  )}
                </div>
              ))}
              {q.kind === "mcq" && q.options.length < 5 && <button onClick={() => { const options = [...q.options, "New option"]; editQ(q.id, { options }); saveQ({ ...q, options }); }} className="text-xs font-bold ml-8" style={{ color: C.blue }}>+ Add option</button>}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase" style={{ color: C.muted }}>Tap the circle next to an option to mark it correct.</div>
          </div>
        ))}
        {qs.length === 0 && <div className="text-xs" style={{ color: C.muted }}>No questions yet — add MCQ or True/False above.</div>}
      </div>
    </div>
  );
}


function daysSince(iso) {
  if (!iso) return null;
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  return Math.floor(diff);
}
function pretty(n) { if (n === null) return "Never"; if (n === 0) return "Today"; if (n === 1) return "1 day ago"; return `${n} days ago`; }

function Progress() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      const [profiles, sessions, quizzes, subs, atts, attend] = await Promise.all([
        fetchProfiles(), fetchCourse(), fetchQuizzes(), fetchAllSubmissions(), fetchAllAttempts(), fetchAllAttendance()
      ]);
      setData({ profiles, sessions, quizzes, subs, atts, attend });
    })();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const { profiles, sessions, quizzes, subs, atts, attend } = data;
    return profiles.filter((p) => p.role === "tutor" && p.status === "enrolled").map((p) => {
      // build per-session status
      const perSession = sessions.map((s) => {
        const written = s.assignments || [];
        const writtenDone = written.length > 0 && written.every((a) => subs.some((x) => x.assignment_id === a.id && x.user_id === p.id));
        const quiz = quizzes.find((z) => z.session_id === s.id);
        const bestAtt = quiz ? atts.filter((a) => a.quiz_id === quiz.id && a.user_id === p.id).sort((a, b) => b.score - a.score)[0] : null;
        const quizPassed = !!(bestAtt && bestAtt.passed);
        const done = written.length > 0 ? writtenDone : quizPassed;
        const present = attend.some((r) => r.session_id === s.id && r.tutor_id === p.id && r.present);
        return { s, written, writtenDone, quiz, bestAtt, quizPassed, done, present };
      });
      const sessionsDone = perSession.filter((r) => r.done).length;
      const attended = perSession.filter((r) => r.present).length;
      const writtenTotal = perSession.reduce((n, r) => n + r.written.length, 0);
      const writtenDone = perSession.reduce((n, r) => n + r.written.filter((a) => subs.some((x) => x.assignment_id === a.id && x.user_id === p.id)).length, 0);
      const quizzesTotal = perSession.filter((r) => !!r.quiz).length;
      const quizzesPassed = perSession.filter((r) => r.quizPassed).length;
      const days = daysSince(p.last_active);
      const behind = (sessionsDone < Math.max(0, sessions.length - 2)) && (days === null || days >= 4);
      return { p, perSession, sessionsDone, attended, writtenDone, writtenTotal, quizzesPassed, quizzesTotal, days, behind, total: sessions.length };
    });
  }, [data]);

  if (!data) return <Loading />;

  if (openId) {
    const row = rows.find((r) => r.p.id === openId);
    if (!row) return null;
    return <Detail row={row} onBack={() => setOpenId(null)} />;
  }

  const shown = rows.filter((r) => (r.p.full_name || "").toLowerCase().includes(q.toLowerCase()) || (r.p.email || "").toLowerCase().includes(q.toLowerCase()));
  const behindCount = rows.filter((r) => r.behind).length;

  return (
    <div className="fade-in">
      <Header eyebrow="Cohort at a glance" title="Tutor progress" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>{rows.length} enrolled tutor{rows.length === 1 ? "" : "s"}. {behindCount > 0 ? `${behindCount} may need a nudge.` : "Everyone's tracking well."}</p>

      <div className="mt-6 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.muted} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-sm" style={{ background: C.card, border: `1px solid ${C.line}` }} /></div>

      <div className="mt-4 rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {shown.map((r) => {
          const pct = r.total ? Math.round((r.sessionsDone / r.total) * 100) : 0;
          return (
            <button key={r.p.id} onClick={() => setOpenId(r.p.id)} className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="font-bold truncate">{r.p.full_name || "(no name)"}</span>{r.behind && <span title="Falling behind" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#FDECEC", color: C.red }}><AlertTriangle size={11} /> Nudge</span>}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: C.muted }}>{r.p.whatsapp_number || r.p.email} · Last active: {pretty(r.days)}</div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: C.bg }}><div className="h-full rounded-full" style={{ width: pct + "%", background: pct >= 90 ? C.green : pct >= 50 ? C.blue : C.red }} /></div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]" style={{ color: C.muted }}>
                  <span>Sessions: <b style={{ color: C.ink }}>{r.sessionsDone}/{r.total}</b></span>
                  <span>Attended: <b style={{ color: C.ink }}>{r.attended}/{r.total}</b></span>
                  <span>Assignments: <b style={{ color: C.ink }}>{r.writtenDone}/{r.writtenTotal}</b></span>
                  <span>Quizzes: <b style={{ color: C.ink }}>{r.quizzesPassed}/{r.quizzesTotal}</b></span>
                </div>
              </div>
              <ChevronRight size={18} color={C.muted} />
            </button>
          );
        })}
        {shown.length === 0 && <div className="px-5 py-8 text-center text-sm" style={{ color: C.muted }}>No tutors found.</div>}
      </div>
    </div>
  );
}

function Detail({ row, onBack }) {
  const [copied, setCopied] = useState(false);
  const { p, perSession, sessionsDone, total, attended, writtenDone, writtenTotal, quizzesPassed, quizzesTotal, days } = row;
  const missing = perSession.filter((r) => !r.done).map((r) => r.s);
  const notAttended = perSession.filter((r) => !r.present).map((r) => r.s);
  const firstName = String(p.full_name || "").split(" ")[0] || "there";
  const draftLines = [
    `Hi ${firstName}, quick check-in from Stones of Wisdom Tutors 👋`,
    missing.length ? `You still have to complete: ${missing.map((s) => "Session " + s.sort).join(", ")}.` : `Great work — assignments look solid.`,
    notAttended.length ? `We also didn't see you at: ${notAttended.map((s) => "Session " + s.sort).join(", ")} — anything we can help with?` : "",
    `Log in when you can — small steps count. You've got this!`,
  ].filter(Boolean);
  const draft = draftLines.join("\n\n");
  async function copy() { await navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: C.muted }}><ArrowLeft size={16} /> All tutors</button>
      <div className="mt-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Tutor detail</div>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{p.full_name || "(no name)"}</h1>
      <div className="text-sm" style={{ color: C.muted }}>{p.email}{p.whatsapp_number ? ` · ${p.whatsapp_number}` : ""}</div>
      <div className="text-xs mt-1" style={{ color: C.muted }}>Last active: {pretty(days)}</div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[["Sessions done", `${sessionsDone}/${total}`, C.blue], ["Attended", `${attended}/${total}`, C.green], ["Assignments", `${writtenDone}/${writtenTotal}`, C.purple], ["Quizzes passed", `${quizzesPassed}/${quizzesTotal}`, C.orange]].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}><div className="text-2xl font-extrabold" style={{ color: c }}>{v}</div><div className="text-[11px] font-bold uppercase mt-0.5" style={{ color: C.muted }}>{l}</div></div>
        ))}
      </div>

      <div className="mt-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: C.red }}>Per session</div>
      <div className="mt-2 rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {perSession.map((r) => (
          <div key={r.s.id} className="px-4 py-3 flex items-center gap-3" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">Session {r.s.sort}: {r.s.title}</div>
              <div className="text-[11px] mt-1 flex flex-wrap gap-x-3" style={{ color: C.muted }}>
                <span className="inline-flex items-center gap-1">{r.present ? <CheckCircle2 size={12} color={C.green} /> : <Circle size={12} color={C.muted} />} Attended</span>
                {r.written.length > 0 && <span className="inline-flex items-center gap-1">{r.writtenDone ? <CheckCircle2 size={12} color={C.green} /> : <Circle size={12} color={C.muted} />} Assignment</span>}
                {r.quiz && <span className="inline-flex items-center gap-1">{r.quizPassed ? <CheckCircle2 size={12} color={C.green} /> : r.bestAtt ? <XCircle size={12} color={C.red} /> : <Circle size={12} color={C.muted} />} Quiz{r.bestAtt ? ` (${r.bestAtt.score}%)` : ""}</span>}
              </div>
            </div>
            <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={r.done ? { background: "#E6F5EE", color: C.green } : { background: "#FDECEC", color: C.red }}>{r.done ? "Done" : "Pending"}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.blue }}>WhatsApp nudge — draft</div>
        <pre className="mt-3 whitespace-pre-wrap text-sm">{draft}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={copy} className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.ink }}><Copy size={14} color={C.yellow} /> {copied ? "Copied!" : "Copy message"}</button>
          {p.whatsapp_number && <a href={`https://wa.me/${p.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.green }}>Open WhatsApp</a>}
        </div>
      </div>
    </div>
  );
}


function AdminSubmissions() {
  const [subs, setSubs] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  async function load() { setSubs(await fetchAllSubmissions()); }
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
  if (sub) {
    const isImg = /\.(png|jpe?g|gif|webp)$/i.test(sub.file_name || sub.file_url || "");
    return (
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
              {isImg
                ? <a href={sub.file_url} target="_blank" rel="noreferrer"><img src={sub.file_url} alt={sub.file_name || "submission"} className="rounded-2xl max-h-96 w-auto" style={{ border: `1px solid ${C.line}` }} /></a>
                : <a href={sub.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.blue }}><FileText size={16} color={C.red} /> {sub.file_name || "Open PDF"}</a>}
            </div>
          )}
        </div>
        <div className="mt-4 rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs font-bold uppercase" style={{ color: C.red }}>Feedback</div>
            <button onClick={suggest} disabled={busy} className="btn inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: C.ink }}>{busy ? <Spinner light /> : <Sparkles size={14} color={C.yellow} />} Suggest with AI</button>
          </div>
          <textarea rows={5} value={draft || sub.feedback || ""} onChange={(e) => setDraft(e.target.value)} placeholder="Write feedback, or let AI draft it." className="mt-3 w-full resize-none rounded-2xl px-4 py-3 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
          <button onClick={send} className="btn mt-3 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.green }}><Check size={16} /> Send feedback & mark reviewed</button>
        </div>
      </div>
    );
  }
  const shown = subs.filter((x) => {
    const n = (x.profiles?.full_name || x.profiles?.email || "").toLowerCase();
    const t = (x.assignments?.sessions?.title || "").toLowerCase();
    return n.includes(q.toLowerCase()) || t.includes(q.toLowerCase());
  });
  return (
    <div className="fade-in">
      <Header eyebrow="Review tutor work" title="Submissions" />
      <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <Search size={16} color={C.muted} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by tutor or session…" className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="mt-4 space-y-3">
        {shown.length === 0 && <div className="rounded-3xl p-8 text-center text-sm" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted }}>No submissions yet.</div>}
        {shown.map((x) => { const isNew = x.status !== "reviewed"; return (
          <button key={x.id} onClick={() => { setOpenId(x.id); setDraft(x.feedback || ""); }} className="lift w-full flex items-center gap-4 rounded-2xl p-4 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full text-xs font-black text-white" style={{ background: C.blue }}>{(x.profiles?.full_name || x.profiles?.email || "T").split(" ").map((y) => y[0]).slice(0, 2).join("")}</span>
            <span className="min-w-0 flex-1"><span className="block font-bold truncate">{x.profiles?.full_name || x.profiles?.email}</span><span className="block text-xs truncate" style={{ color: C.muted }}>{x.assignments?.sessions?.title} · {x.assignments?.title}</span></span>
            {x.file_url && <FileText size={15} color={C.muted} className="shrink-0" />}
            <span className="ml-1 text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0" style={isNew ? { background: "#FDECEC", color: C.red } : { background: "#E6F5EE", color: C.green }}>{isNew ? "New" : "Reviewed"}</span>
          </button>
        ); })}
      </div>
    </div>
  );
}
