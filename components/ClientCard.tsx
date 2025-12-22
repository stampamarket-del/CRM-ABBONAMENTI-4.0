import React from 'react';
import { Client, Product, Seller, SubscriptionType } from '../types';
import SubscriptionTimer from './SubscriptionTimer';
import { Trash2Icon, AlertTriangleIcon, PencilIcon, ClockIcon, BriefcaseIcon } from './Icons';

interface ClientCardProps {
  client: Client;
  onDelete: (clientId: string) => void;
  onEdit: (client: Client) => void;
  product?: Product;
  seller?: Seller;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onDelete, onEdit, product, seller }) => {

  const commission = product && seller ? (product.price * seller.commissionRate) / 100 : 0;
  
  const isExpiringSoon = () => {
    const endDate = new Date(client.subscription.endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return endDate > now && endDate <= thirtyDaysFromNow;
  };
  
  const isNotStarted = new Date(client.subscription.startDate) > new Date();

  const subscriptionTypeLabels: Record<SubscriptionType, string> = {
    monthly: 'Mensile',
    annual: 'Annuale',
    trial: 'Prova',
  };
  const subscriptionLabel = subscriptionTypeLabels[client.subscriptionType] || 'N/D';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 flex flex-col relative">
      {isExpiringSoon() && (
        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 p-2 rounded-full z-10 animate-pulse" title="Abbonamento in scadenza a breve!">
          <AlertTriangleIcon className="w-5 h-5" />
        </div>
      )}
      {isNotStarted && (
        <div className="absolute top-4 right-4 bg-blue-400 text-blue-900 p-2 rounded-full z-10" title="Abbonamento non ancora iniziato!">
          <ClockIcon className="w-5 h-5" />
        </div>
      )}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{client.name} {client.surname}</h3>
            {client.companyName && <p className="text-sm font-bold text-blue-600 uppercase tracking-tight mt-0.5">{client.companyName}</p>}
            <div className="mt-1">
              <a href={`mailto:${client.email}`} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">{client.email}</a>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            <button 
                onClick={() => onEdit(client)}
                className="text-slate-400 hover:text-blue-600 hover:bg-white transition-all p-2 rounded-lg shadow-sm"
                aria-label="Modifica cliente"
            >
                <PencilIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onDelete(client.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-white transition-all p-2 rounded-lg shadow-sm"
                aria-label="Elimina cliente"
            >
                <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
            <div>
              <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Prodotto</strong>
              <p className="text-sm font-bold text-slate-800">{product ? product.name : 'N/D'}</p>
              <p className="text-xs font-medium text-slate-500">{product ? `${product.price.toFixed(2)}€` : '-'}</p>
              
              {seller && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-tight bg-blue-50 px-2 py-1 rounded-lg w-fit">
                   <BriefcaseIcon className="w-3 h-3" />
                   <span>{seller.name}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Provvigione</strong>
              <p className="text-sm font-bold text-slate-800">{seller ? `${commission.toFixed(2)}€` : '0.00€'}</p>
              {seller && <p className="text-[10px] font-medium text-green-600">Rate: {seller.commissionRate}%</p>}
            </div>
          </div>

          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Stato Abbonamento</strong>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  client.subscriptionType === 'annual' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  client.subscriptionType === 'trial' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {subscriptionLabel}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Inizio</p>
                <p className="text-xs font-black text-slate-700">{formatDate(client.subscription.startDate)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 bg-slate-200 rounded-full mt-2"></div>
              <div>
                <strong className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Dati Fiscali</strong>
                <p className="text-xs font-medium text-slate-600">{client.vatNumber ? `P.IVA: ${client.vatNumber}` : 'Nessuna P.IVA'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 bg-slate-200 rounded-full mt-2"></div>
              <div>
                <strong className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Recapito</strong>
                <p className="text-xs font-medium text-slate-600 line-clamp-1">{client.address || 'Nessun indirizzo'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50/30 p-6 border-t border-slate-100">
        <SubscriptionTimer subscription={client.subscription} />
      </div>
    </div>
  );
};

export default ClientCard;