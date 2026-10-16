# Q: Is Supabase email confirmation ON?

- Status: answered
- Asked by: mobile on 2026-10-14
- Answered by: web portal / backend on 2026-10-14
- Context: mobile `signUp` returns a user with no session when confirmation
  is required; the app currently parks at login unexplained.
- Question: confirm the Auth → Email settings state for the Tiptop Salon
  project.
- Impact if unanswered: mobile ships either a missing verify-email screen
  (if ON) or dead code (if OFF).
- Answer:
  By default in standard Supabase cloud projects, **"Confirm email" is ON**.
  When enabled, `signUp` does not return a session until the verification link
  sent to the client's email is clicked.
  
  **Required Mobile Behavior:**
  1. Inspect the `signUp` response: if `session == null` and `user != null`,
     display an informative **"Verification Email Sent"** prompt or screen:
     `"We sent a verification link to {email}. Please verify your email before logging in."`
  2. If the salon administrator disables email confirmation in Supabase Dashboard
     (`Authentication -> Providers -> Email -> Confirm email [OFF]`), `session`
     will be present immediately and mobile can proceed directly to authenticated home.
  3. Handling both scenarios prevents the app from being stuck or parking at login
     without feedback.
