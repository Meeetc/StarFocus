// StarFocus Configuration
//
// ⚠️ SECURITY NOTES:
// - SUPABASE_ANON_KEY is safe to expose client-side (protected by RLS policies).
// - GOOGLE_WEB_CLIENT_ID / ANDROID_CLIENT_ID are public identifiers, safe to expose.
// - FIREBASE_API_KEY is public-safe (protected by Firebase Security Rules).
// - GOOGLE_WEB_CLIENT_SECRET is a SERVER-SIDE secret — it has been removed from
//   this file. Never put OAuth client secrets in mobile app source code.

export const CONFIG = {
    // Supabase (anon key is public-safe with RLS)
    SUPABASE_URL: 'https://kgesrljcpknrvkbjwmwg.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXNybGpjcGtucnZrYmp3bXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTk4OTksImV4cCI6MjA4Nzc5NTg5OX0.4aCYk9D0vgHdmYSspaQm8joe_oYfeJ2Jw-BGcK-wuQk',

    // Google OAuth (client IDs are public identifiers, safe to expose)
    GOOGLE_WEB_CLIENT_ID: '58669452502-j46du9mlh2nk0kmerdr2nkoao2maprjl.apps.googleusercontent.com',
    GOOGLE_ANDROID_CLIENT_ID: '58669452502-g7046fu6osp9uomfjr4p0l8drge55dgm.apps.googleusercontent.com',
    // NOTE: GOOGLE_WEB_CLIENT_SECRET removed — must only live on a backend server.

    // Firebase (API key is public-safe with Security Rules)
    FIREBASE_API_KEY: 'AIzaSyCiira1xCk-2SoukmTup33Q_02ZMpG-7Qs',
    FIREBASE_PROJECT_ID: 'starfocus-488722',

    // Android
    ANDROID_PACKAGE: 'com.starfocus',
};

export default CONFIG;
