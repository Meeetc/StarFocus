// Supabase Client Configuration
// Environment variables should be set in .env file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgesrljcpknrvkbjwmwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXNybGpjcGtucnZrYmp3bXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTk4OTksImV4cCI6MjA4Nzc5NTg5OX0.4aCYk9D0vgHdmYSspaQm8joe_oYfeJ2Jw-BGcK-wuQk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export default supabase;
