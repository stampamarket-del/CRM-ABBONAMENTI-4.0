import React from 'react';
import { Client, Product } from '../types';
import { MailIcon, UsersIcon, ClockIcon, CalculatorIcon, AlertTriangleIcon } from './Icons';

interface DashboardProps {
  clients: Client[];
  products: Product[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-between group hover:shadow-2xl transition-all duration-300">
    <div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
      <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
    <div className={`${color} p-4 rounded-2xl shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ clients, products }) => {
  const activeClients = clients.filter(c => new Date(c.subscription.endDate) > new Date());
  
  const totalRevenue = clients.reduce((acc, client) => {
    const product = products.find(p => p.id === client.productId);
    return acc + (product?.price || 0);
  }, 0);

  const expiringSoonClients = clients.filter(client => {
    const endDate = new Date(client.subscription.endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return endDate > now && endDate <= thirtyDaysFromNow;
  });

  const handleSendReminder = (client: Client) => {
    const product = products.find(p => p.id === client.productId);
    const endDate = new Date(client.subscription.endDate).toLocaleDateString('it-IT');

    const subject = `Promemoria Scadenza Abbonamento`;
    const body = `Gentile ${client.name} ${client.surname},

Le ricordiamo che il Suo abbonamento per "${product?.name || 'il nostro servizio'}" scadrà il ${endDate}.

Per mantenere attivi i servizi senza interruzioni, La invitiamo a procedere con il rinnovo.

Cordiali saluti,
Customer Success Team`;

    const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Clienti Totali" value={clients.length} icon={<UsersIcon className="w-8 h-8" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Abbonamenti Attivi" value={activeClients.length} icon={<ClockIcon className="w-8 h-8" />} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Volume d'Affari" value={`€${totalRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`} icon={<CalculatorIcon className="w-8 h-8" />} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                    <AlertTriangleIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Alert Scadenze (Prossimi 30gg)</h2>
            </div>
            <span className="bg-slate-100 text-slate-500 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{expiringSoonClients.length} POSIZIONI</span>
        </div>

        <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {expiringSoonClients.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Email</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Scadenza</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorità</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Azioni Veloci</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expiringSoonClients.sort((a,b) => new Date(a.subscription.endDate).getTime() - new Date(b.subscription.endDate).getTime()).map(client => {
                    const endDate = new Date(client.subscription.endDate);
                    const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysLeft <= 7;
                    
                    return (
                      <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                            <div className="font-black text-slate-900">{client.name} {client.surname}</div>
                            <div className="text-xs font-medium text-slate-400">{client.email}</div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="text-sm font-black text-slate-700 uppercase tracking-tight">{endDate.toLocaleDateString('it-IT')}</div>
                        </td>
                        <td className="px-8 py-5">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                             isUrgent ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-orange-100 text-orange-600 border border-orange-200'
                           }`}>
                             {daysLeft} Giorni
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                              onClick={() => handleSendReminder(client)}
                              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-black py-2 px-5 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              <MailIcon className="w-3.5 h-3.5" />
                              Rinnovo
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-center">
                 <div className="bg-emerald-50 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                    <ClockIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nessuna scadenza critica</h3>
                 <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Tutte le posizioni sono regolarmente coperte per i prossimi 30 giorni.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;