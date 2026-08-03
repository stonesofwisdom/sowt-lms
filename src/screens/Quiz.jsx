import React, { useState } from "react";
import { Spinner } from "../components/ui.jsx";
import { C } from "../theme";
import { submitAttempt } from "../db";
import { ListChecks, Check, X, RotateCw, ArrowLeft } from "lucide-react";

export default function Quiz({ quiz, bestAttempt, onDone, uid }) {
  const [phase, setPhase] = useState(bestAttempt?.passed ? "result" : "intro");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(bestAttempt || null);

  const pass = quiz.pass_mark || 70;
  const qs = quiz.questions || [];

  async function submit() {
    setBusy(true);
    const correct = qs.filter((q) => answers[q.id] === q.correct).length;
    const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
    const passed = score >= pass;
    try {
      await submitAttempt(quiz.id, uid, score, passed, answers);
      const r = { score, passed, answers };
      setResult(r); setPhase("result");
      if (passed && onDone) onDone(r);
    } catch (e) { alert(e.message); }
    setBusy(false);
  }
  function retry() { setAnswers({}); setI(0); setPhase("quiz"); setResult(null); }

  if (qs.length === 0) return <div className="text-sm" style={{ color: C.muted }}>This quiz has no questions yet.</div>;

  if (phase === "intro") return (
    <div className="rounded-2xl p-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2"><ListChecks size={18} color={C.blue} /><div className="font-black">{quiz.title}</div></div>
      <div className="mt-2 text-sm" style={{ color: C.muted }}>{qs.length} question{qs.length === 1 ? "" : "s"} · Pass at {pass}% · Retake until passed</div>
      {bestAttempt && !bestAttempt.passed && <div className="mt-3 rounded-xl p-3 text-sm" style={{ background: "#FDECEC", color: C.red }}>Your last score: <b>{bestAttempt.score}%</b>. Try again to pass.</div>}
      <button onClick={() => setPhase("quiz")} className="btn mt-3 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.blue }}><ListChecks size={16} /> Start quiz</button>
    </div>
  );

  if (phase === "result") {
    const passed = result?.passed;
    return (
      <div className="rounded-2xl p-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2"><ListChecks size={18} color={C.blue} /><div className="font-black">{quiz.title}</div></div>
        <div className={`mt-3 rounded-2xl p-4 text-center`} style={{ background: passed ? "#E6F5EE" : "#FDECEC" }}>
          <div className="text-3xl font-extrabold" style={{ color: passed ? C.green : C.red }}>{result.score}%</div>
          <div className="mt-1 text-sm font-bold" style={{ color: passed ? C.green : C.red }}>{passed ? `Passed! (needed ${pass}%)` : `Not yet — try again (need ${pass}%)`}</div>
        </div>
        <div className="mt-4 space-y-3">
          {qs.map((q, idx) => { const my = result.answers?.[q.id]; const right = my === q.correct; return (
            <div key={q.id} className="rounded-xl p-3 text-sm" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-start gap-2"><span className="grid place-items-center h-5 w-5 rounded-full shrink-0 mt-0.5" style={{ background: right ? C.green : C.red }}>{right ? <Check size={12} color="#fff" /> : <X size={12} color="#fff" />}</span><div className="font-bold">{idx + 1}. {q.question}</div></div>
              <div className="mt-2 pl-7 space-y-1">
                {q.options.map((opt, oi) => {
                  const isMine = my === oi; const isCorrect = q.correct === oi;
                  return <div key={oi} className={`px-3 py-1.5 rounded-lg text-xs ${isCorrect ? "font-bold" : ""}`} style={{ background: isCorrect ? "#E6F5EE" : isMine && !isCorrect ? "#FDECEC" : "transparent", color: isCorrect ? C.green : isMine && !isCorrect ? C.red : C.ink }}>{opt}{isCorrect ? " ✓" : ""}{isMine && !isCorrect ? " (your answer)" : ""}</div>;
                })}
              </div>
            </div>
          ); })}
        </div>
        {!passed && <button onClick={retry} className="btn mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.blue }}><RotateCw size={16} /> Retake quiz</button>}
      </div>
    );
  }

  // quiz phase
  const q = qs[i]; const chosen = answers[q.id];
  const canNext = chosen !== undefined; const last = i === qs.length - 1;
  return (
    <div className="rounded-2xl p-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between"><div className="text-xs font-bold uppercase" style={{ color: C.muted }}>Question {i + 1} of {qs.length}</div>{i > 0 && <button onClick={() => setI(i - 1)} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: C.muted }}><ArrowLeft size={13} /> Back</button>}</div>
      <div className="mt-3 font-bold text-[15px]">{q.question}</div>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, oi) => { const sel = chosen === oi; return (
          <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm" style={{ background: sel ? "#EEF0FE" : C.card, border: `2px solid ${sel ? C.blue : C.line}`, fontWeight: sel ? 700 : 500 }}>
            <span className="grid place-items-center h-5 w-5 rounded-full shrink-0" style={{ background: sel ? C.blue : "transparent", border: `2px solid ${sel ? C.blue : C.line}` }}>{sel && <span className="h-2 w-2 rounded-full bg-white" />}</span>
            {opt}
          </button>
        ); })}
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        {!last && <button onClick={() => setI(i + 1)} disabled={!canNext} className="btn rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.blue, opacity: canNext ? 1 : 0.5 }}>Next</button>}
        {last && <button onClick={submit} disabled={!canNext || busy} className="btn inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.green, opacity: canNext && !busy ? 1 : 0.5 }}>{busy ? <Spinner light /> : <Check size={15} />} Submit</button>}
      </div>
    </div>
  );
}
