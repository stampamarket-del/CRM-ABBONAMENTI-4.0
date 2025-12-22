
import React, { useState } from 'react';
import { MailIcon, AlertTriangleIcon, ClockIcon, BarChartIcon, CalculatorIcon, BriefcaseIcon } from './Icons';

interface AuthProps {
  onSuccess: () => void;
}

const BenefitItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h4 className="text-white font-bold text-lg">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulazione processo di login locale
    setTimeout(() => {
      if (password.length < 6) {
        setError('La password deve contenere almeno 6 caratteri.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('crm_is_authenticated', 'true');
      onSuccess();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* SEZIONE SINISTRA: LOGO E BENEFICI */}
      <div className="w-full md:w-1/2 bg-[#0F172A] p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden">
        {/* Decorazione di sfondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3">
               <span className="font-black text-2xl text-white">C</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Gestione Abbonamenti</h1>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-black text-white leading-[1.1] mb-8">
              Il motore per il tuo <span className="text-blue-500">Business locale.</span>
            </h2>
            
            <div className="space-y-2">
              <BenefitItem 
                icon={<ClockIcon className="w-6 h-6" />}
                title="Monitoraggio Scadenze"
                desc="Visualizza in tempo reale quanto manca alla fine di ogni abbonamento con timer interattivi."
              />
              <BenefitItem 
                icon={<BriefcaseIcon className="w-6 h-6" />}
                title="Gestione Venditori"
                desc="Assegna clienti ai tuoi venditori e calcola le provvigioni in modo automatico e preciso."
              />
              <BenefitItem 
                icon={<BarChartIcon className="w-6 h-6" />}
                title="Reportistica Avanzata"
                desc="Esporta dati in CSV e analizza le performance di vendita con grafici pronti all'uso."
              />
              <BenefitItem 
                icon={<CalculatorIcon className="w-6 h-6" />}
                title="Simulatore Business"
                desc="Calcola margini, quote soci e costi fissi direttamente dall'area dedicata."
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 text-slate-500 text-sm font-bold tracking-widest uppercase">
          © 2024 CRM Professional Suite • v2.5 Local
        </div>
      </div>

      {/* SEZIONE DESTRA: LOGIN / REGISTRAZIONE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              {isLogin ? 'Bentornato' : 'Inizia ora'}
            </h3>
            <p className="text-slate-500 font-medium italic">
              {isLogin ? 'Inserisci le tue credenziali per accedere alla dashboard.' : 'Crea il tuo spazio di lavoro professionale in pochi secondi.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 animate-shake">
              <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Aziendale</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    placeholder="nome@azienda.it"
                  />
                  <MailIcon className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Password dimenticata?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-white font-black text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>ELABORAZIONE...</span>
                </>
              ) : (
                isLogin ? 'ACCEDI ORA' : 'REGISTRATI GRATIS'
              )}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-slate-200">
            <p className="text-slate-400 font-bold text-sm mb-4">
              {isLogin ? 'Non hai ancora un account?' : 'Hai già un account attivo?'}
            </p>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              {isLogin ? "Crea nuovo account" : "Torna al Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
