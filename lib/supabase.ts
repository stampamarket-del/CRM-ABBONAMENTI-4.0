import { createClient } from '@supabase/supabase-js';

// NOTA: Sostituisci questi valori con quelli del tuo progetto Supabase
// URL del progetto (es. https://abc.supabase.co)
const supabaseUrl = 'https://eleugtfuttwbyxnlhvup.supabase.co';
// La chiave 'anon' pubblica che trovi in Settings -> API
const supabaseAnonKey = 'sb_publishable_T4PHrFtqHgUz258h1ypR3A_4HDRPwSU_4HDRPwSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});