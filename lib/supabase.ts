import { createClient } from '@supabase/supabase-js';

// URL del progetto Supabase
const supabaseUrl = 'https://eleugtfuttwbyxnlhvup.supabase.co';

/**
 * NOTA PER L'AMMINISTRATORE:
 * Se ricevi l'errore "Invalid API key", sostituisci la stringa sotto
 * con la 'anon' key (Public) che trovi in:
 * Supabase Dashboard -> Project Settings -> API -> Project API keys (anon/public)
 */
const supabaseAnonKey = 'sb_publishable_T4PHrFtqHgUz258h1ypR3A_4HDRPwSU_4HDRPwSU';

// Helper per verificare se la chiave sembra valida (le chiavi Supabase reali sono solitamente lunghi JWT)
const isKeyPotentiallyValid = (key: string) => {
  return key.length > 40 && key.includes('.');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});

export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
    if (error) {
      // Se l'errore è 401 o contiene "API key", la chiave è errata
      if (error.code === '401' || error.message?.toLowerCase().includes('api key')) {
        return { ok: false, error: 'INVALID_KEY', message: error.message };
      }
      return { ok: false, error: 'DB_ERROR', message: error.message };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: 'NETWORK_ERROR', message: e.message };
  }
};