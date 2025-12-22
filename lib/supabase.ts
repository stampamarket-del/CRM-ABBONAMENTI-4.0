import { createClient } from '@supabase/supabase-js';

// Project Supabase URL
const supabaseUrl = 'https://eleugtfuttwbyxnlhvup.supabase.co';

// API Key obtained exclusively from environment variables as per guidelines
const supabaseAnonKey = process.env.API_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});

export const checkConnection = async () => {
  if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    return { ok: false, error: 'MISSING_KEY', message: 'Chiave API non configurata nell\'ambiente.' };
  }

  try {
    // Perform a lightweight query to verify authorization
    const { error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
    
    if (error) {
      // 401 Unauthorized or specific "API key" error messages
      if (error.code === '401' || error.message?.toLowerCase().includes('api key')) {
        return { ok: false, error: 'INVALID_KEY', message: 'La chiave API configurata non è valida per questo progetto.' };
      }
      return { ok: false, error: 'DB_ERROR', message: error.message };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: 'NETWORK_ERROR', message: e.message };
  }
};