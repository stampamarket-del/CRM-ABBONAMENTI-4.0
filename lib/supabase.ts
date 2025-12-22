import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eleugtfuttwbyxnlhvup.supabase.co';
// The key below must be the valid Project API 'anon' key from Supabase Settings.
const supabaseAnonKey = 'sb_publishable_T4PHrFtqHgUz258h1ypR3A_4HDRPwSU_4HDRPwSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});