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
export async function submitAnswer(assignment_id, user_id, content, feedback, file_url, file_name) {
  const row = { assignment_id, user_id, content, feedback, status: "new" };
  if (file_url !== undefined) row.file_url = file_url;
  if (file_name !== undefined) row.file_name = file_name;
  const { data, error } = await supabase.from("submissions")
    .upsert(row, { onConflict: "assignment_id,user_id" })
    .select().single();
  if (error) throw error;
  return data;
}

// Upload an assignment file (image/pdf) to the public "submissions" bucket.
export async function uploadSubmissionFile(user_id, assignment_id, file) {
  const ext = (file.name.split(".").pop() || "dat").toLowerCase();
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${user_id}/${assignment_id}-${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage.from("submissions").upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("submissions").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name };
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

// --- Q&A ---
export async function fetchQuestions() {
  const [{ data: qs }, { data: ans }] = await Promise.all([
    supabase.from("questions").select("*").order("created_at", { ascending: false }),
    supabase.from("answers").select("*").order("created_at"),
  ]);
  return (qs || []).map((q) => ({ ...q, answers: (ans || []).filter((a) => a.question_id === q.id) }));
}
export async function askQuestion(author_name, body) {
  const { error } = await supabase.from("questions").insert({ author_name, author_role: "Tutor", body });
  if (error) throw error;
}
export async function answerQuestion(question_id, author_name, author_role, body) {
  const { error } = await supabase.from("answers").insert({ question_id, author_name, author_role, body });
  if (error) throw error;
}

// --- Attendance ---
export async function fetchTutors() {
  const { data } = await supabase.from("profiles").select("id, full_name, email").eq("status", "enrolled").eq("role", "tutor");
  return data || [];
}
export async function fetchSessionAttendance(session_id) {
  const { data } = await supabase.from("attendance").select("*").eq("session_id", session_id);
  return data || [];
}
export async function setAttendance(session_id, tutor_id, present) {
  const { error } = await supabase.from("attendance").upsert({ session_id, tutor_id, present }, { onConflict: "session_id,tutor_id" });
  if (error) throw error;
}
export async function fetchMyAttendance(uid) {
  const { data } = await supabase.from("attendance").select("session_id, present").eq("tutor_id", uid);
  return (data || []).filter((r) => r.present).map((r) => r.session_id);
}
export async function setSort(id, sort) { await supabase.from("sessions").update({ sort }).eq("id", id); }

// --- Resources ---
export async function fetchResources() {
  const { data } = await supabase.from("resources").select("*").order("sort");
  return data || [];
}
export async function addResource() {
  const { data, error } = await supabase.from("resources").insert({ title: "New resource", url: "https://", description: "", sort: 999 }).select().single();
  if (error) throw error;
  return data;
}
export async function saveResource(r) {
  const { error } = await supabase.from("resources").update({ title: r.title, url: r.url, description: r.description, sort: r.sort }).eq("id", r.id);
  if (error) throw error;
}
export async function deleteResource(id) { await supabase.from("resources").delete().eq("id", id); }

// --- Quizzes ---
export async function fetchQuizzes() {
  const [{ data: quizzes }, { data: qs }] = await Promise.all([
    supabase.from("quizzes").select("*").order("id"),
    supabase.from("quiz_questions").select("*").order("sort"),
  ]);
  return (quizzes || []).map((z) => ({ ...z, questions: (qs || []).filter((q) => q.quiz_id === z.id) }));
}
export async function fetchMyAttempts(uid) {
  const { data } = await supabase.from("quiz_attempts").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return data || [];
}
export async function submitAttempt(quiz_id, user_id, score, passed, answers) {
  const { error } = await supabase.from("quiz_attempts").insert({ quiz_id, user_id, score, passed, answers });
  if (error) throw error;
}
export async function addQuiz(session_id) {
  const { data, error } = await supabase.from("quizzes").insert({ session_id, title: "Session Quiz", pass_mark: 70 }).select().single();
  if (error) throw error;
  return data;
}
export async function saveQuiz(q) { await supabase.from("quizzes").update({ title: q.title }).eq("id", q.id); }
export async function deleteQuiz(id) { await supabase.from("quizzes").delete().eq("id", id); }
export async function addQuizQuestion(quiz_id, kind, sort) {
  const q = kind === "tf"
    ? { quiz_id, question: "New question", kind: "tf", options: ["True", "False"], correct: 0, sort }
    : { quiz_id, question: "New question", kind: "mcq", options: ["Option A", "Option B", "Option C", "Option D"], correct: 0, sort };
  const { data } = await supabase.from("quiz_questions").insert(q).select().single();
  return data;
}
export async function saveQuizQuestion(q) {
  await supabase.from("quiz_questions").update({ question: q.question, options: q.options, correct: q.correct, sort: q.sort }).eq("id", q.id);
}
export async function deleteQuizQuestion(id) { await supabase.from("quiz_questions").delete().eq("id", id); }

// --- Admin: all data for progress tracking ---
export async function fetchAllSubmissions() {
  const { data } = await supabase.from("submissions").select("assignment_id, user_id, status");
  return data || [];
}
export async function fetchAllAttempts() {
  const { data } = await supabase.from("quiz_attempts").select("quiz_id, user_id, score, passed, created_at");
  return data || [];
}
export async function fetchAllAttendance() {
  const { data } = await supabase.from("attendance").select("session_id, tutor_id, present");
  return data || [];
}
export async function touchLastActive(uid) {
  try { await supabase.from("profiles").update({ last_active: new Date().toISOString() }).eq("id", uid); } catch (e) {}
}
