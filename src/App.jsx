import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Logo, Loading } from "./components/ui.jsx";
import Auth from "./screens/Auth.jsx";
import ResetPassword from "./screens/ResetPassword.jsx";
import { touchLastActive } from "./db";
import Pending from "./screens/Pending.jsx";
import TutorApp from "./screens/TutorApp.jsx";
import AdminApp from "./screens/AdminApp.jsx";
import FacilitatorApp from "./screens/FacilitatorApp.jsx";
import Progress from "./screens/Progress.jsx";
import Verify from "./screens/Verify.jsx";
import Profile from "./screens/Profile.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  const wantProgress = typeof window !== "undefined" && window.location.search.toLowerCase().includes("progress");

  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data || null);
    if (data) touchLastActive(uid);
  }
  async function refresh() {
    const { data } = await supabase.auth.getSession();
    if (data.session) await loadProfile(data.session.user.id);
  }
  function signOut() { supabase.auth.signOut(); setProfile(null); }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      if (_e === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(sess);
      if (sess) { await loadProfile(sess.user.id); } else { setProfile(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Public certificate verification (no login needed): sowt-lms.netlify.app/?verify=CODE
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  if (params && params.has("verify")) return <Verify initialCode={params.get("verify")} />;
  if (params && params.has("tutor")) return <Profile tutorId={params.get("tutor")} />;

  if (loading) return <div className="min-h-screen grid place-items-center"><div className="text-center"><Logo height={54} /><div className="mt-4"><Loading /></div></div></div>;
  if (recovery) return <ResetPassword onDone={() => setRecovery(false)} />;
  if (!session) return <Auth />;
  if (!profile || profile.status !== "enrolled") return <Pending name={profile?.full_name} onSignOut={signOut} onRefresh={refresh} />;

  // Secret admin-only progress dashboard: visit sowt-lms.netlify.app/?progress
  if (profile.role === "admin" && wantProgress) {
    return (
      <div className="min-h-screen" style={{ background: "#F7F8FA" }}>
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 py-4" style={{ background: "#fff", borderBottom: "1px solid #ECEDF2" }}>
          <Logo height={30} />
          <a href="/" className="text-sm font-bold rounded-2xl px-4 py-2" style={{ background: "#EEF0FE", color: "#6366F1" }}>← Back to admin</a>
        </div>
        <div className="mx-auto max-w-4xl px-5 md:px-10 py-8 md:py-12"><Progress /></div>
      </div>
    );
  }

  if (profile.role === "admin") return <AdminApp profile={profile} onSignOut={signOut} />;
  if (profile.role === "facilitator") return <FacilitatorApp profile={profile} onSignOut={signOut} />;
  return <TutorApp profile={profile} onSignOut={signOut} />;
}
