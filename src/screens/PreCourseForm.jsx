import React from "react";
import { Header } from "../components/ui.jsx";
import { C } from "../theme";
import { CheckCircle2, ExternalLink } from "lucide-react";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSczqV9nPfucbPDmd9t_8YBhszF1BQbz9CE__IGDBH_Yrdj-rA/viewform?embedded=true";
const FORM_URL_OPEN = "https://docs.google.com/forms/d/e/1FAIpQLSczqV9nPfucbPDmd9t_8YBhszF1BQbz9CE__IGDBH_Yrdj-rA/viewform";

export default function PreCourseForm({ done, onDone }) {
  if (done) {
    return (
      <div className="fade-in">
        <Header eyebrow="Completed" title="Pre-Course Form" />
        <div className="mt-6 rounded-3xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl" style={{ background: "#E6F5EE" }}><CheckCircle2 size={28} color={C.green} /></div>
          <div className="mt-4 text-lg font-black">Thank you — this is done.</div>
          <p className="mt-1 text-sm max-w-sm mx-auto" style={{ color: C.muted }}>Your pre-course form is completed and won't appear again.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fade-in">
      <Header eyebrow="Please complete first" title="Pre-Course Form" />
      <p className="mt-2 text-sm" style={{ color: C.muted }}>A quick 2-minute form so we can teach at exactly your level. Fill it below, then tap "I've completed it".</p>
      <div className="mt-6 rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <iframe title="Pre-Course Form" src={FORM_URL} className="w-full" style={{ height: 600, border: "none" }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={onDone} className="btn rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ background: C.blue }}>I've completed the form</button>
        <a href={FORM_URL_OPEN} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted }}><ExternalLink size={14} /> Open in a new tab</a>
      </div>
    </div>
  );
}
