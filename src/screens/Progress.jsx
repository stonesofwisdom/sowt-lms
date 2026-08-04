import React, { useEffect, useMemo, useState } from "react";
import { Header, Loading } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchProfiles, fetchCourse, fetchQuizzes, fetchAllSubmissions, fetchAllAttempts, fetchAllAttendance } from "../db";
import { AlertTriangle, ArrowLeft, ChevronRight, Search, CheckCircle2, Circle, XCircle, Copy } from "lucide-react";

function daysSince(iso) {
  if (!iso) return null;
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  return Math.floor(diff);
}
function pretty(n) { if (n === null) return "Never"; if (n === 0) return "Today"; if (n === 1) return "1 day ago"; return `${n} days ago`; }

export default function Progress() {
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
