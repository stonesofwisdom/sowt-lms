import React, { useEffect, useState } from "react";
import { Header, Loading } from "../components/ui.jsx";
import { C } from "../theme";
import { fetchAnnouncements, postAnnouncement, fetchQuestions, askQuestion, answerQuestion } from "../db";
import { Megaphone, MessageSquare } from "lucide-react";

export default function Community({ profile, canAnnounce }) {
  const [sub, setSub] = useState("news");
  const [ann, setAnn] = useState(null);
  const [qs, setQs] = useState(null);
  const [at, setAt] = useState(""); const [ab, setAb] = useState("");
  const [q, setQ] = useState("");
  const [answering, setAnswering] = useState(null); const [ans, setAns] = useState("");
  const role = profile.role === "admin" ? "Programme lead" : profile.role === "facilitator" ? "Facilitator" : "Tutor";
  const nm = profile.full_name || profile.email;
  async function load() { setAnn(await fetchAnnouncements()); setQs(await fetchQuestions()); }
  useEffect(() => { load(); }, []);
  async function post() { if (!at.trim() || !ab.trim()) return; await postAnnouncement({ author_name: nm, author_role: role, title: at.trim(), body: ab.trim() }); setAt(""); setAb(""); load(); }
  async function ask() { if (!q.trim()) return; await askQuestion(nm, q.trim()); setQ(""); load(); }
  async function answer(id) { if (!ans.trim()) return; await answerQuestion(id, nm, role, ans.trim()); setAns(""); setAnswering(null); load(); }
  if (!ann || !qs) return <Loading />;
  return (
    <div className="fade-in">
      <Header eyebrow="Stay in the loop" title="Community" />
      <div className="mt-5 inline-flex gap-1 rounded-2xl p-1" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {[["news", "Announcements"], ["qa", "Q&A"]].map(([id, l]) => <button key={id} onClick={() => setSub(id)} className="rounded-xl px-4 py-2 text-sm font-bold" style={sub === id ? { background: C.ink, color: "#fff" } : { color: C.muted }}>{l}</button>)}
      </div>
      {sub === "news" ? (
        <div className="mt-6 space-y-3">
          {canAnnounce && (
            <div className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.purple }}>Post an announcement</div>
              <input value={at} onChange={(e) => setAt(e.target.value)} placeholder="Title" className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
              <textarea rows={2} value={ab} onChange={(e) => setAb(e.target.value)} placeholder="What do you want the cohort to know?" className="mt-2 w-full resize-none rounded-xl px-3 py-2 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
              <button onClick={post} className="btn mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}><Megaphone size={15} /> Post</button>
            </div>
          )}
          {ann.length === 0 && <div className="text-sm" style={{ color: C.muted }}>No announcements yet.</div>}
          {ann.map((a) => (
            <div key={a.id} className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2"><Megaphone size={16} color={C.purple} /><div className="font-black">{a.title}</div></div>
              <p className="mt-2 text-sm">{a.body}</p>
              <div className="mt-2 text-xs" style={{ color: C.muted }}>{a.author_name} · {a.author_role}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(); }} placeholder="Ask the cohort a question…" className="flex-1 rounded-xl px-3 py-2 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
              <button onClick={ask} className="btn rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>Ask</button>
            </div>
          </div>
          {qs.length === 0 && <div className="text-sm" style={{ color: C.muted }}>No questions yet — be the first to ask.</div>}
          {qs.map((x) => (
            <div key={x.id} className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-start gap-2"><MessageSquare size={16} color={C.blue} className="mt-0.5" /><div><div className="font-bold">{x.body}</div><div className="text-xs" style={{ color: C.muted }}>{x.author_name}</div></div></div>
              {x.answers.map((an) => (
                <div key={an.id} className="mt-3 ml-6 rounded-2xl p-3 text-sm" style={{ background: C.bg }}>
                  <div>{an.body}</div><div className="mt-1 text-xs font-semibold" style={{ color: an.author_role === "Programme lead" ? C.red : C.blue }}>{an.author_name} · {an.author_role}</div>
                </div>
              ))}
              {answering === x.id ? (
                <div className="mt-3 ml-6 flex gap-2">
                  <input value={ans} onChange={(e) => setAns(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") answer(x.id); }} placeholder="Write an answer…" className="flex-1 rounded-xl px-3 py-2 text-sm" style={{ background: C.bg, border: `1px solid ${C.line}` }} />
                  <button onClick={() => answer(x.id)} className="btn rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>Send</button>
                </div>
              ) : (
                <button onClick={() => { setAnswering(x.id); setAns(""); }} className="mt-3 ml-6 text-xs font-bold" style={{ color: C.blue }}>Answer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
