import React, { useEffect, useRef, useState } from "react";
import { Header, Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { ai } from "../ai";
import { Bot, PenLine, MessageSquare, ListChecks, Sparkles, Send } from "lucide-react";

function curriculumText(sessions) {
  return sessions.map((s) => `Session ${s.sort}: ${s.title}. Objectives: ${(s.objectives || []).join("; ")}.`).join("\n");
}
const box = { background: C.bg, border: `1px solid ${C.line}` };

export default function AIStudio({ sessions }) {
  const [tab, setTab] = useState("assistant");
  const ctx = curriculumText(sessions);
  const TABS = [
    { id: "assistant", label: "Assistant", icon: Bot },
    { id: "planner", label: "Lesson planner", icon: PenLine },
    { id: "practice", label: "Practice partner", icon: MessageSquare },
    { id: "quiz", label: "Quiz maker", icon: ListChecks },
  ];
  return (
    <div className="fade-in">
      <Header eyebrow="Live AI · use it for your own students" title="AI Studio" />
      <div className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl p-1" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {TABS.map((t) => { const A = t.icon; return <button key={t.id} onClick={() => setTab(t.id)} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold" style={tab === t.id ? { background: C.ink, color: "#fff" } : { color: C.muted }}><A size={15} />{t.label}</button>; })}
      </div>
      <div className="mt-6">
        {tab === "assistant" && <Assistant ctx={ctx} />}
        {tab === "planner" && <Planner ctx={ctx} />}
        {tab === "practice" && <Practice />}
        {tab === "quiz" && <Quiz sessions={sessions} ctx={ctx} />}
      </div>
    </div>
  );
}

function Assistant({ ctx }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your AI Tutor Assistant, and I know your whole Masterclass curriculum. Ask me anything about teaching online, pricing, getting students, or a specific session." }]);
  const [input, setInput] = useState(""); const [busy, setBusy] = useState(false); const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);
  async function send() {
    const c = input.trim(); if (!c || busy) return;
    const next = [...messages, { role: "user", content: c }]; setMessages(next); setInput(""); setBusy(true);
    const reply = await ai({ system: "You are the AI Tutor Assistant in Stones of Wisdom Tutors' Masterclass. Warm, practical, encouraging mentor for online tutors (many Nigerian). Refer to specific sessions when relevant.\n\nCurriculum:\n" + ctx, messages: next.map((m) => ({ role: m.role, content: m.content })) });
    setMessages([...next, { role: "assistant", content: reply }]); setBusy(false);
  }
  return (
    <div className="rounded-3xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap" style={m.role === "user" ? { background: C.blue, color: "#fff" } : { background: C.bg, border: `1px solid ${C.line}` }}>{m.content}</div></div>)}
        {busy && <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}><Spinner /> thinking…</div>}
        <div ref={end} />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask anything…" className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm" style={box} />
        <button onClick={send} disabled={busy} className="btn grid place-items-center h-12 w-12 rounded-2xl text-white" style={{ background: C.blue }}><Send size={18} /></button>
      </div>
    </div>
  );
}

function Planner({ ctx }) {
  const [subject, setSubject] = useState(""); const [level, setLevel] = useState(""); const [topic, setTopic] = useState(""); const [dur, setDur] = useState("45 minutes");
  const [out, setOut] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    if (!topic.trim() || busy) return; setBusy(true); setOut("");
    const r = await ai({ system: "You are an expert curriculum designer coaching an online tutor. Produce a clear, ready-to-use lesson plan with: a one-line objective, materials, a timed structure (starter, 2-3 main activities with timings, a check for understanding, a plenary), and one differentiation tip. Practical, concise, simple headings.", messages: [{ role: "user", content: `Create a ${dur} online lesson plan.\nSubject: ${subject || "(general)"}\nLevel: ${level || "(unspecified)"}\nTopic: ${topic}` }], max_tokens: 1300 });
    setOut(r); setBusy(false);
  }
  return (
    <div className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (e.g. Mathematics)" className="rounded-xl px-3 py-2 text-sm" style={box} />
        <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Level / age (e.g. JSS2)" className="rounded-xl px-3 py-2 text-sm" style={box} />
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Simultaneous equations)" className="sm:col-span-2 rounded-xl px-3 py-2 text-sm" style={box} />
        <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder="Length" className="rounded-xl px-3 py-2 text-sm" style={box} />
      </div>
      <button onClick={go} disabled={busy || !topic.trim()} className="btn mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.ink, opacity: busy || !topic.trim() ? 0.6 : 1 }}>{busy ? <Spinner light /> : <Sparkles size={15} color={C.yellow} />}{busy ? "Building…" : "Generate lesson plan"}</button>
      {out && <div className="fade-in mt-4 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={box}>{out}</div>}
    </div>
  );
}

function Practice() {
  const SCEN = [
    { id: "parent", label: "Difficult parent", sys: "You are role-playing a slightly frustrated parent of a struggling student, talking to their online tutor. Stay in character, realistic but not abusive, short replies (1-3 sentences)." },
    { id: "discovery", label: "Discovery call", sys: "You are role-playing a prospective client (a parent) on a discovery call with an online tutor. Ask normal questions about approach, price and results. Stay in character, short replies." },
    { id: "anxious", label: "Anxious student", sys: "You are role-playing a shy, anxious teenage student in an online lesson. Hesitant, low confidence, short replies." },
  ];
  const [scen, setScen] = useState(null); const [messages, setMessages] = useState([]); const [input, setInput] = useState(""); const [busy, setBusy] = useState(false); const [fb, setFb] = useState(""); const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, fb]);
  function start(s) { setScen(s); setFb(""); setMessages([{ role: "assistant", content: s.id === "parent" ? "Hello, thanks for making time. I'll be honest — I'm a bit worried, I'm not seeing much improvement." : s.id === "discovery" ? "Hi! So — tell me, how do you actually help students like mine?" : "um... hi. sorry, i'm not really good at this subject..." }]); }
  async function send() {
    const c = input.trim(); if (!c || busy || !scen) return;
    const next = [...messages, { role: "user", content: c }]; setMessages(next); setInput(""); setBusy(true);
    const reply = await ai({ system: scen.sys, messages: next.map((m) => ({ role: m.role, content: m.content })) });
    setMessages([...next, { role: "assistant", content: reply }]); setBusy(false);
  }
  async function feedback() {
    if (busy) return; setBusy(true);
    const transcript = messages.map((m) => `${m.role === "user" ? "Tutor" : "Other"}: ${m.content}`).join("\n");
    const r = await ai({ system: "You are a warm communication coach. Given a role-play transcript, give the TUTOR short feedback: 2 things they did well, 2 to improve, 1 tip. Under 150 words.", messages: [{ role: "user", content: transcript }] });
    setFb(r); setBusy(false);
  }
  if (!scen) return (
    <div className="rounded-3xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="text-sm font-bold">Pick a scenario. The AI plays the other person; you practise responding.</div>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        {SCEN.map((s) => <button key={s.id} onClick={() => start(s)} className="lift rounded-2xl p-4 text-left" style={box}><div className="font-bold">{s.label}</div><div className="text-xs mt-1" style={{ color: C.muted }}>Start role-play</div></button>)}
      </div>
    </div>
  );
  return (
    <div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm font-bold">Role-play: {scen.label}</div>
        <div className="flex gap-2">
          <button onClick={feedback} disabled={busy || messages.length < 2} className="btn rounded-2xl px-4 py-2 text-xs font-bold" style={{ background: C.yellow, color: C.ink, opacity: busy || messages.length < 2 ? 0.5 : 1 }}>End & get feedback</button>
          <button onClick={() => setScen(null)} className="rounded-2xl px-4 py-2 text-xs font-bold" style={{ background: C.card, border: `1px solid ${C.line}` }}>Change</button>
        </div>
      </div>
      <div className="mt-3 rounded-3xl p-4 space-y-3 max-h-96 overflow-y-auto" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap" style={m.role === "user" ? { background: C.blue, color: "#fff" } : { background: C.bg, border: `1px solid ${C.line}` }}>{m.content}</div></div>)}
        {busy && <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}><Spinner /> …</div>}
        <div ref={end} />
      </div>
      {fb && <div className="fade-in mt-3 rounded-2xl p-4 text-sm whitespace-pre-wrap" style={{ background: "#FFF9DC", border: `1px solid ${C.yellow}` }}><div className="mb-1 text-xs font-bold uppercase" style={{ color: C.red }}>Coach feedback</div>{fb}</div>}
      <div className="mt-3 flex items-end gap-2">
        <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Your response…" className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm" style={box} />
        <button onClick={send} disabled={busy} className="btn grid place-items-center h-12 w-12 rounded-2xl" style={{ background: C.yellow }}><Send size={18} color={C.ink} /></button>
      </div>
    </div>
  );
}

function Quiz({ sessions, ctx }) {
  const [sid, setSid] = useState(sessions[0]?.id); const [out, setOut] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    const s = sessions.find((x) => x.id === Number(sid)); if (!s || busy) return; setBusy(true); setOut("");
    const r = await ai({ system: "You are a tutor trainer. Based ONLY on the given objectives, write exactly 3 short knowledge-check questions, each with a one-line model answer. Format: 'Q1: ...' then 'A1: ...', blank line between.", messages: [{ role: "user", content: `Session: ${s.title}\nObjectives:\n- ${(s.objectives || []).join("\n- ")}` }], max_tokens: 600 });
    setOut(r); setBusy(false);
  }
  return (
    <div className="rounded-3xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="text-sm" style={{ color: C.muted }}>Generate a quick quiz from any session's objectives — for yourself, or for your own students.</div>
      <div className="mt-4 flex flex-wrap gap-2 items-end">
        <select value={sid} onChange={(e) => setSid(e.target.value)} className="rounded-xl px-3 py-2 text-sm font-semibold" style={box}>{sessions.map((s) => <option key={s.id} value={s.id}>Session {s.sort}: {s.title}</option>)}</select>
        <button onClick={go} disabled={busy} className="btn inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.ink, opacity: busy ? 0.6 : 1 }}>{busy ? <Spinner light /> : <ListChecks size={16} color={C.yellow} />}Generate quiz</button>
      </div>
      {out && <div className="fade-in mt-4 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={box}>{out}</div>}
    </div>
  );
}
