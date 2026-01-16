import React from 'react';
import { Product, Seller } from '../types';
import { SearchIcon, XIcon } from './Icons';

interface ClientFilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterProductId: string;
    setFilterProductId: (id: string) => void;
    filterSellerId: string;
    setFilterSellerId: (id: string) => void;
    filterSubscriptionType: string;
    setFilterSubscriptionType: (type: string) => void;
    sortOrder: string;
    setSortOrder: (order: string) => void;
    products: Product[];
    sellers: Seller[];
}

const ClientFilterBar: React.FC<ClientFilterBarProps> = ({
    searchTerm,
    setSearchTerm,
    filterProductId,
    setFilterProductId,
    filterSellerId,
    setFilterSellerId,
    filterSubscriptionType,
    setFilterSubscriptionType,
    sortOrder,
    setSortOrder,
    products,
    sellers,
}) => {

    const handleReset = () => {
        setSearchTerm('');
        setFilterProductId('');
        setFilterSellerId('');
        setFilterSubscriptionType('');
        setSortOrder('expiry_desc');
    };
    
    const filtersAreActive = searchTerm || filterProductId || filterSellerId || filterSubscriptionType;

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cerca cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-2 border-2 border-slate-50 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        aria-label="Cerca cliente"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </div>
                </div>

                <select value={filterProductId} onChange={(e) => setFilterProductId(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 border-2 border-slate-50 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" aria-label="Filtra per prodotto">
                    <option value="">Tutti i Prodotti</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <select value={filterSellerId} onChange={(e) => setFilterSellerId(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 border-2 border-slate-50 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" aria-label="Filtra per venditore">
                    <option value="">Tutti i Venditori</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select value={filterSubscriptionType} onChange={(e) => setFilterSubscriptionType(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 border-2 border-slate-50 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" aria-label="Filtra per tipo abbonamento">
                    <option value="">Tutti i Tipi</option>
                    <option value="monthly">Mensile</option>
                    <option value="annual">Annuale</option>
                    <option value="trial">Prova</option>
                </select>

                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 border-2 border-slate-50 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" aria-label="Ordina per">
                    <option value="expiry_desc">Scadenza ↓</option>
                    <option value="expiry_asc">Scadenza ↑</option>
                    <option value="name_asc">Nome A-Z</option>
                </select>

            </div>
             { filtersAreActive && (
                 <div className="mt-4 flex justify-end">
                    <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors duration-200 text-[10px] uppercase tracking-widest">
                        <XIcon className="w-4 h-4" />
                        Resetta Filtri
                    </button>
                </div>
             )}
        </div>
    );
};

export default ClientFilterBar;