import React from "react";
import { Logo } from "../components/ui.jsx";
import { C } from "../theme";
import { Clock, LogOut, RefreshCw } from "lucide-react";

export default function Pending({ name, onSignOut, onRefresh }) {
  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={56} /></div>
        <div className="rounded-3xl p-8" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl" style={{ background: "#FFF6DA" }}><Clock size={28} color={C.orange} /></div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">You're almost in{name ? `, ${String(name).split(" ")[0]}` : ""}!</h1>
          <p className="mt-2 text-sm" style={{ color: C.muted }}>Your account has been created and is awaiting verification. We'll confirm your details. Drop your name and WhatsApp number and indicate "awaiting LMS verification" on the WhatsApp group to get access — no further action needed.</p>
          <p className="mt-3 text-sm font-semibold">Make sure the name you signed up with matches the name you want on your certificate.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button onClick={onRefresh} className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: C.blue }}><RefreshCw size={15} /> Check again</button>
            <button onClick={onSignOut} className="btn inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold" style={{ background: C.card, border: `1px solid ${C.line}` }}><LogOut size={15} /> Sign out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
