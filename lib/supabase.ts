import { createClient } from '@supabase/supabase-js';

// Project Supabase URL fornito dall'utente
const supabaseUrl = 'https://eugxpgztgjgkjrixepyz.supabase.co';

// NOTA: In questo ambiente, process.env.API_KEY è riservata esclusivamente all'integrazione con l'API Google Gemini.
// Per la connessione a Supabase è necessario utilizzare la chiave anonima specifica del progetto fornita dall'utente.
const supabaseAnonKey = 'sb_publishable_KsgTnYjFNZTj2ZH76Bk80A_V6x6p3IL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});

export const checkConnection = async () => {
  if (!supabaseAnonKey) {
    return { ok: false, error: 'MISSING_KEY', message: 'Chiave Supabase non configurata.' };
  }

  try {
    // Test di connessione leggero su una delle tabelle principali
    const { error } = await supabase.from('clients').select('id').limit(1);
    
    if (error) {
      return { ok: false, error: 'DB_ERROR', message: error.message };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: 'NETWORK_ERROR', message: e.message };
  }
};