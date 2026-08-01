=====================================================
 SOWT LMS — Setup Guide (plain English, no coding)
=====================================================
You'll set up 3 free accounts and paste a few keys. ~45 minutes on a laptop.
Nothing here needs coding. Just copy, paste, and click.

WHAT YOU'RE PUTTING LIVE
- A website where people sign up and land as "Pending".
- You (admin) approve them from the Members page, and they're in.
- Tutors watch recordings, read objectives, submit assignments, get AI feedback.
- Facilitators open their sessions and review submissions.
- Everything is saved. Zoom stays your classroom; WhatsApp stays your quick chat.

-----------------------------------------------------
PART 1 — DATABASE (Supabase)                 ~15 min
-----------------------------------------------------
1. Go to supabase.com -> sign up (free) -> "New project".
   Give it a name + a strong database password (save that password). Wait ~2 min.
2. Left menu -> "SQL Editor" -> "New query".
3. Open the file  schema.sql  (in this folder). Select ALL, copy, paste into the
   box, click RUN. You should see "Success". (You never need to read it.)
4. Left menu -> "Project Settings" -> "API". Copy and keep these two:
      - Project URL
      - anon public key
5. Left menu -> "Authentication" -> "Providers" -> make sure "Email" is ON.
   Recommended: turn OFF "Confirm email" so people can sign in immediately.

-----------------------------------------------------
PART 2 — AI KEY (Anthropic)                   ~5 min
-----------------------------------------------------
1. console.anthropic.com -> sign up -> Billing -> add a card.
2. "API Keys" -> "Create Key" -> copy it (starts sk-ant-...). Keep it.

-----------------------------------------------------
PART 3 — PUT THE APP ONLINE (GitHub + Netlify) ~20 min
-----------------------------------------------------
A) Put the code on GitHub (free):
   1. github.com -> sign up -> "New repository" -> name it "sowt-lms" -> Create.
   2. On the repo page click "uploading an existing file".
   3. Unzip this folder on your computer, then drag ALL of its files/folders into
      the upload box -- EXCEPT the "node_modules" folder if you see one (skip it).
      (These files: src, netlify, index.html, package.json, vite.config.js,
       netlify.toml, schema.sql, SETUP.md, etc.) Click "Commit changes".

B) Deploy on Netlify (free):
   1. netlify.com -> sign up -> "Add new site" -> "Import an existing project"
      -> choose GitHub -> pick your "sowt-lms" repo.
   2. It auto-detects the settings from netlify.toml. Click Deploy.
   3. Once deployed: Site configuration -> "Environment variables" -> add THREE:
         VITE_SUPABASE_URL       = your Project URL       (Part 1, step 4)
         VITE_SUPABASE_ANON_KEY  = your anon public key    (Part 1, step 4)
         ANTHROPIC_API_KEY       = your sk-ant-... key      (Part 2)
   4. Deploys -> "Trigger deploy" -> "Deploy site".  You now have a live link.
   (Optional: Netlify lets you rename the link or add your own domain later.)

-----------------------------------------------------
PART 4 — MAKE YOURSELF THE ADMIN              ~2 min
-----------------------------------------------------
1. Open your live link -> "Create an account" -> sign up with YOUR email.
2. Back in Supabase -> "Table editor" -> "profiles" -> find your row ->
   set  role = admin  and  status = enrolled  -> save the row.
3. Refresh the app. You now see the Admin console.

-----------------------------------------------------
EVERYDAY USE
-----------------------------------------------------
- Someone signs up -> shows in your Members list as "Pending".
- They send their receipt to Ms. Lydia (same as now).
- You click "Enrol". They're in. (New people are ALWAYS pending until you enrol.)
- Facilitators: in Members, set someone's role to "facilitator" and enrol them.
  Then in "Course content", pick that facilitator on the sessions they teach
  (their name now appears in the dropdown). They'll see those sessions.
- Recordings: in "Course content", paste each session's recording link
  (Zoom, YouTube, or Drive URL). Tutors get a "Watch recording" button.
- Release a session: use "Module open" after the live class, and
  "Assignments active" so tutors can submit.

That's it. You're live.
