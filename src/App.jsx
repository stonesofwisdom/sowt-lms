import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Logo, Loading } from "./components/ui.jsx";
import Auth from "./screens/Auth.jsx";
import Pending from "./screens/Pending.jsx";
import TutorApp from "./screens/TutorApp.jsx";
import AdminApp from "./screens/AdminApp.jsx";
import FacilitatorApp from "./screens/FacilitatorApp.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data || null);
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
      setSession(sess);
      if (sess) { await loadProfile(sess.user.id); } else { setProfile(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center"><div className="text-center"><Logo height={54} /><div className="mt-4"><Loading /></div></div></div>;
  if (!session) return <Auth />;
  if (!profile || profile.status !== "enrolled") return <Pending name={profile?.full_name} onSignOut={signOut} onRefresh={refresh} />;
  if (profile.role === "admin") return <AdminApp profile={profile} onSignOut={signOut} />;
  if (profile.role === "facilitator") return <FacilitatorApp profile={profile} onSignOut={signOut} />;
  return <TutorApp profile={profile} onSignOut={signOut} />;
}
