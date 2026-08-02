import React, { useState } from "react";
import { supabase } from "../supabase";
import { Logo, Spinner } from "../components/ui.jsx";
import { C } from "../theme";

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState(""); const [wa, setWa] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const inp = { background: C.bg, border: `1px solid ${C.line}` };

  async function submit() {
    setMsg(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { full_name: name, whatsapp: wa } } });
        if (error) throw error;
        setMsg("Account created! If asked, confirm your email, then sign in. New accounts stay pending until an admin enrols you.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
    } catch (e) { setMsg(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo height={60} /></div>
        <div className="rounded-3xl p-7" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: C.red }}>Get Paid to Teach Online · Masterclass</div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <div className="mt-5 space-y-3">
            {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name (as you want it on your certificate)" className="w-full rounded-2xl px-4 py-3 text-sm" style={inp} />}
            {mode === "signup" && <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="WhatsApp number (the one in the group)" className="w-full rounded-2xl px-4 py-3 text-sm" style={inp} />}
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
            <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Password" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} className="w-full rounded-2xl px-4 py-3 text-sm" style={inp} />
          </div>
          <button onClick={submit} disabled={busy} className="btn mt-4 w-full rounded-2xl px-5 py-3 text-sm font-bold text-white inline-flex items-center justify-center gap-2" style={{ background: C.blue, opacity: busy ? 0.7 : 1 }}>{busy ? <Spinner light /> : null}{mode === "signup" ? "Sign up" : "Sign in"}</button>
          {msg && <div className="mt-3 text-xs" style={{ color: C.muted }}>{msg}</div>}
          <div className="mt-4 text-center text-sm">
            {mode === "signup"
              ? <>Already have an account? <button onClick={() => { setMode("signin"); setMsg(""); }} className="font-bold" style={{ color: C.blue }}>Sign in</button></>
              : <>New here? <button onClick={() => { setMode("signup"); setMsg(""); }} className="font-bold" style={{ color: C.blue }}>Create an account</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}
