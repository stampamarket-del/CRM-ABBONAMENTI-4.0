import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MailIcon, AlertTriangleIcon } from './Icons';

interface AuthProps {
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;
      onSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Errore di autenticazione.';
      if (msg.includes('Failed to fetch') || msg.includes('Invalid API key')) {
        msg = 'Errore di configurazione del server (Chiave API non valida). Contatta l\'amministratore.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="mb-10 text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6 rotate-3">
              <span className="text-white font-black text-3xl">C</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Bentornato' : 'Inizia Ora'}
            </h2>
            <p className="text-slate-500 font-medium italic">
              {isLogin ? 'Accedi al tuo CRM professionale' : 'Crea il tuo spazio di gestione'}
            </p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-semibold leading-snug">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Aziendale</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 pl-12 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all group-hover:bg-slate-100"
                    placeholder="email@azienda.it"
                  />
                  <MailIcon className="absolute left-4 top-4.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all group-hover:bg-slate-100"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-white font-black text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>ELABORAZIONE...</span>
                </div>
              ) : (
                isLogin ? 'ACCEDI ORA' : 'REGISTRATI GRATIS'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors py-2 px-4 rounded-xl hover:bg-slate-50"
            >
              {isLogin ? "Non hai un account? Registrati qui" : "Hai già un account? Torna al login"}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest opacity-50">
          &copy; 2024 CRM DASHBOARD PROFESSIONAL
        </p>
      </div>
    </div>
  );
};

export default Auth;