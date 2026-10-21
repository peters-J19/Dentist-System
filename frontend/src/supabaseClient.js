// Shared Supabase client for the whole frontend, using the public anon key.
// This is what handles login/session state (see AuthPage/RequireAuth) and
// would also be the client to use for any direct, RLS-protected reads/writes.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);