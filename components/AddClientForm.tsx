import React, { useState } from 'react';
import { Client, Product, Seller, SubscriptionType } from '../types';
import { XIcon } from './Icons';

interface AddClientFormProps {
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onClose: () => void;
  products: Product[];
  sellers: Seller[];
}

const AddClientForm: React.FC<AddClientFormProps> = ({ onAddClient, onClose, products, sellers }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    address: '',
    email: '',
    companyName: '',
    vatNumber: '',
    iban: '',
    otherInfo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    productId: '',
    sellerId: '',
    subscriptionType: 'monthly',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, surname, email, address, startDate, endDate, productId } = formData;
    if (!name || !surname || !email || !address || !startDate || !endDate || !productId) {
      setError('Tutti i campi obbligatori (*) devono essere compilati.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      setError("La data di scadenza deve essere successiva a quella di inizio.");
      return;
    }

    onAddClient({
      name,
      surname,
      email,
      address,
      companyName: formData.companyName,
      vatNumber: formData.vatNumber,
      iban: formData.iban,
      otherInfo: formData.otherInfo,
      productId: formData.productId,
      sellerId: formData.sellerId,
      subscriptionType: formData.subscriptionType as SubscriptionType,
      subscription: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-end sm:items-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col transition-all">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Nuovo Cliente</h2>
            <p className="text-slate-400 font-medium text-[10px] sm:text-sm uppercase tracking-wider mt-0.5">Inserimento dati anagrafici</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
            <XIcon className="w-6 h-6 sm:w-8 h-8" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold flex items-center gap-3 text-sm">
              <div className="bg-red-500 text-white p-1 rounded-full flex-shrink-0"><XIcon className="w-3 h-3" /></div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Anagrafica Base</h3>
              <div className="space-y-3 sm:space-y-4">
                <input type="text" name="name" placeholder="Nome *" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required />
                <input type="text" name="surname" placeholder="Cognome *" value={formData.surname} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required />
                <input type="email" name="email" placeholder="Email Diretta *" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required />
                <input type="text" name="address" placeholder="Indirizzo Completo *" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Dettagli Aziendali</h3>
              <div className="space-y-3 sm:space-y-4">
                <input type="text" name="companyName" placeholder="Ragione Sociale" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" />
                <input type="text" name="vatNumber" placeholder="P. IVA / Cod. Fiscale" value={formData.vatNumber} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" />
                <input type="text" name="iban" placeholder="Codice IBAN" value={formData.iban} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" />
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-100">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1 mb-4 sm:mb-6">Configurazione Abbonamento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <select name="productId" value={formData.productId} onChange={handleChange} className="px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required>
                <option value="">Prodotto *</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price}€)</option>)}
              </select>
              <select name="subscriptionType" value={formData.subscriptionType} onChange={handleChange} className="px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm" required>
                <option value="monthly">Mensile</option>
                <option value="annual">Annuale</option>
                <option value="trial">Prova</option>
              </select>
               <select name="sellerId" value={formData.sellerId} onChange={handleChange} className="px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-sm">
                <option value="">Venditore</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Inizio *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-medium text-sm" required />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Scadenza *</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-medium text-sm" required />
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pb-4">
            <button type="button" onClick={onClose} className="order-2 sm:order-1 px-8 py-3.5 sm:py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl sm:rounded-2xl transition-all text-sm uppercase tracking-widest">Annulla</button>
            <button type="submit" className="order-1 sm:order-2 px-8 py-3.5 sm:py-4 bg-blue-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 text-sm uppercase tracking-widest">Salva Cliente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientForm;