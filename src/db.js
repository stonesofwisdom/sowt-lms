import { supabase } from "./supabase";

export async function fetchCourse() {
  const [{ data: sessions }, { data: assignments }] = await Promise.all([
    supabase.from("sessions").select("*").order("sort"),
    supabase.from("assignments").select("*").order("id"),
  ]);
  return (sessions || []).map((s) => ({ ...s, assignments: (assignments || []).filter((a) => a.session_id === s.id) }));
}
export async function fetchMySubs(uid) {
  const { data } = await supabase.from("submissions").select("*").eq("user_id", uid);
  return data || [];
}
export async function submitAnswer(assignment_id, user_id, content, feedback) {
  const { data, error } = await supabase.from("submissions")
    .upsert({ assignment_id, user_id, content, feedback, status: "new" }, { onConflict: "assignment_id,user_id" })
    .select().single();
  if (error) throw error;
  return data;
}
export async function fetchAnnouncements() {
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function postAnnouncement(a) {
  const { error } = await supabase.from("announcements").insert(a);
  if (error) throw error;
}
export async function fetchProfiles() {
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function updateProfile(id, patch) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}
export async function fetchAllSubs() {
  const { data } = await supabase.from("submissions")
    .select("*, profiles(full_name,email), assignments(title,prompt,session_id, sessions(title,facilitator))")
    .order("created_at", { ascending: false });
  return data || [];
}
export async function updateSubmission(id, patch) {
  const { error } = await supabase.from("submissions").update(patch).eq("id", id);
  if (error) throw error;
}
export async function saveSession(s) {
  const { id, assignments, ...fields } = s;
  const { error } = await supabase.from("sessions").update(fields).eq("id", id);
  if (error) throw error;
}
export async function addSession(sort) {
  const { data, error } = await supabase.from("sessions")
    .insert({ week: "Week ?", theme: "New theme", title: "New session", description: "", objectives: [], activity: "", facilitator: "SOWT Faculty", session_date: "TBC", sort: sort || 999, is_open: false, assignments_active: false })
    .select().single();
  if (error) throw error;
  return data;
}
export async function deleteSession(id) { await supabase.from("sessions").delete().eq("id", id); }
export async function addAssignment(session_id) {
  const { data } = await supabase.from("assignments").insert({ session_id, title: "New assignment", prompt: "Describe the task." }).select().single();
  return data;
}
export async function saveAssignment(a) { await supabase.from("assignments").update({ title: a.title, prompt: a.prompt }).eq("id", a.id); }
export async function deleteAssignment(id) { await supabase.from("assignments").delete().eq("id", id); }
export async function fetchFacilitators() {
  const { data } = await supabase.from("profiles").select("full_name").eq("role", "facilitator");
  return (data || []).map((x) => x.full_name).filter(Boolean);
}
