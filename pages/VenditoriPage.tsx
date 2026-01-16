import React, { useState, useMemo } from 'react';
import { Seller, Client, Product } from '../types';
import { PlusCircleIcon, PencilIcon, Trash2Icon, BriefcaseIcon, UsersIcon } from '../components/Icons';

interface AddSellerFormProps {
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onClose: () => void;
}

const AddSellerForm: React.FC<AddSellerFormProps> = ({ onAddSeller, onClose }) => {
  const [name, setName] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !commissionRate || isNaN(parseFloat(commissionRate))) return;
    onAddSeller({ name, commissionRate: parseFloat(commissionRate) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold p-6 border-b">Aggiungi Nuovo Venditore</h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="text" placeholder="Nome Venditore" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Provvigione (%)" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required step="0.1" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Annulla</button>
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Aggiungi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditSellerFormProps {
  seller: Seller;
  onUpdateSeller: (seller: Seller) => void;
  onClose: () => void;
}

const EditSellerForm: React.FC<EditSellerFormProps> = ({ seller, onUpdateSeller, onClose }) => {
  const [name, setName] = useState(seller.name);
  const [commissionRate, setCommissionRate] = useState(seller.commissionRate.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !commissionRate || isNaN(parseFloat(commissionRate))) return;
    onUpdateSeller({ ...seller, name, commissionRate: parseFloat(commissionRate) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold p-6 border-b">Modifica Venditore</h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="text" placeholder="Nome Venditore" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Provvigione (%)" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required step="0.1" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Annulla</button>
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Scheda Venditore
const SellerCard: React.FC<{
  seller: Seller;
  stats: {
    salesCount: number;
    totalRevenue: number;
    totalCommission: number;
  };
  onEdit: (seller: Seller) => void;
  onDelete: (sellerId: string) => void;
}> = ({ seller, stats, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <BriefcaseIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{seller.name}</h3>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-tight">Provv. {seller.commissionRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(seller)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" aria-label={`Modifica ${seller.name}`}>
              <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(seller.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" aria-label={`Elimina ${seller.name}`}>
              <Trash2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-100 p-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clienti</p>
          <p className="text-base font-black text-slate-800 flex items-center justify-center gap-1">
            <UsersIcon className="w-3 h-3 text-slate-400" /> {stats.salesCount}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fatturato</p>
          <p className="text-base font-black text-slate-800">€{stats.totalRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compenso</p>
          <p className="text-base font-black text-emerald-600">€{stats.totalCommission.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
};

interface VenditoriPageProps {
  sellers: Seller[];
  clients: Client[];
  products: Product[];
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onUpdateSeller: (seller: Seller) => void;
  onDeleteSeller: (sellerId: string) => void;
}

const VenditoriPage: React.FC<VenditoriPageProps> = ({ sellers, clients, products, onAddSeller, onUpdateSeller, onDeleteSeller }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

   const sellerStatsMap = useMemo(() => {
     const stats: Record<string, { salesCount: number, totalRevenue: number, totalCommission: number }> = {};
     
     sellers.forEach(seller => {
       const sellerClients = clients.filter(client => client.sellerId === seller.id && new Date(client.subscription.endDate) > new Date());
       
       const report = sellerClients.reduce((acc, client) => {
         const product = products.find(p => p.id === client.productId);
         if (product) {
           const commission = (product.price * seller.commissionRate) / 100;
           acc.totalRevenue += product.price;
           acc.totalCommission += commission;
         }
         return acc;
       }, { totalRevenue: 0, totalCommission: 0 });

       stats[seller.id] = {
         salesCount: sellerClients.length,
         ...report
       };
     });
     
     return stats;
   }, [sellers, clients, products]);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 uppercase text-xs tracking-widest">
            <PlusCircleIcon className="w-5 h-5" />
            Aggiungi Venditore
        </button>
      </div>

      {sellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sellers.map(seller => (
            <SellerCard
              key={seller.id}
              seller={seller}
              stats={sellerStatsMap[seller.id] || { salesCount: 0, totalRevenue: 0, totalCommission: 0 }}
              onEdit={setEditingSeller}
              onDelete={onDeleteSeller}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100 px-6">
            <div className="bg-slate-50 text-slate-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nessun venditore</h2>
            <p className="mt-2 text-slate-400 font-medium text-sm">Registra i membri del team commerciale per tracciarne le performance.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest">
                <PlusCircleIcon className="w-5 h-5" />
                Aggiungi ora
            </button>
        </div>
      )}

      {isModalOpen && <AddSellerForm onAddSeller={onAddSeller} onClose={() => setIsModalOpen(false)} />}
      {editingSeller && <EditSellerForm seller={editingSeller} onUpdateSeller={onUpdateSeller} onClose={() => setEditingSeller(null)} />}
    </div>
  );
};

export default VenditoriPage;