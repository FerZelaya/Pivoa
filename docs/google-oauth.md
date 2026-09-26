# Google sign-in for Pivoa

Pivoa uses Supabase Auth with the Google provider. The app buttons call `signInWithOAuth` and return to `/auth/callback`.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. **APIs & Services → OAuth consent screen**. Choose External (or Internal for a Workspace org). Fill in the app name (`Pivoa`) and support email. Save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - your production web origin
6. Authorized redirect URIs:
   - Local Supabase: `http://127.0.0.1:54321/auth/v1/callback`
   - Hosted Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client secret**.

## 2. Local Supabase

Create or edit `supabase/.env` (this file is not committed):

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-client-secret
```

`supabase/config.toml` already enables `[auth.external.google]` and reads those env vars. Restart local Auth after changing them:

```
supabase stop
supabase start
```

## 3. Hosted Supabase (production)

1. Open the project in the Supabase Dashboard.
2. **Authentication → Providers → Google**.
3. Enable the provider and paste the same Client ID and Client secret.
4. Confirm the callback URL shown in the dashboard is listed under Authorized redirect URIs in Google Cloud.

## 4. App routes

- Login and Register show **Continue with Google**.
- After Google redirects back, `/auth/callback` waits for the session and sends the user to `/overview`.
- If that Google email already has a Pivoa account (email/password or prior Google), Auth links the identity to the existing user. They skip setup and land in the app.
- First-time Google users (new email) still go through onboarding (currency, reset day, monthly cap, goals).
- The Google button sends `login_hint` when an email is typed and `prompt=select_account` so the matching Google account can be chosen.
