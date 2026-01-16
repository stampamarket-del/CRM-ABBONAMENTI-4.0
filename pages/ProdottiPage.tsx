import React, { useState, useMemo } from 'react';
import { Product, Client } from '../types';
import { PlusCircleIcon, PencilIcon, Trash2Icon, PackageIcon, UsersIcon } from '../components/Icons';
import ProductBarChart from '../components/ProductBarChart';

// Form per Aggiungere
interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || isNaN(parseFloat(price))) return;
    onAddProduct({ name, price: parseFloat(price) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold p-6 border-b">Aggiungi Nuovo Prodotto</h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="text" placeholder="Nome Prodotto" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Prezzo" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required step="0.01" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Annulla</button>
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Aggiungi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Form per Modificare
interface EditProductFormProps {
  product: Product;
  onUpdateProduct: (product: Product) => void;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onUpdateProduct, onClose }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || isNaN(parseFloat(price))) return;
    // We send only the updated base fields
    onUpdateProduct({ ...product, name, price: parseFloat(price) });
    onClose();
  };
  
  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold p-6 border-b">Modifica Prodotto</h2>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="text" placeholder="Nome Prodotto" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="number" placeholder="Prezzo" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required step="0.01" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">Annulla</button>
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Scheda Prodotto
const ProductCard: React.FC<{
  product: Product;
  clientCount: number;
  totalRevenue: number;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}> = ({ product, clientCount, totalRevenue, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <PackageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
              <p className="text-2xl font-black text-blue-600 tracking-tighter">{product.price.toFixed(2)}€</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" aria-label={`Modifica ${product.name}`}>
              <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(product.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" aria-label={`Elimina ${product.name}`}>
              <Trash2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-around text-center">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clienti Attivi</p>
          <p className="text-lg font-black text-slate-800 flex items-center justify-center gap-1"><UsersIcon className="w-4 h-4 text-slate-400" /> {clientCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Affari</p>
          <p className="text-lg font-black text-slate-800">€{totalRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
};

interface ProdottiPageProps {
  products: Product[];
  clients: Client[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProdottiPage: React.FC<ProdottiPageProps> = ({ products, clients, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stats calculation separated from the raw product list to avoid pollution
  const productStatsMap = useMemo(() => {
    const stats: Record<string, { clientCount: number, totalRevenue: number }> = {};
    
    products.forEach(product => {
      const activeClients = clients.filter(c => c.productId === product.id && new Date(c.subscription.endDate) > new Date());
      stats[product.id] = {
        clientCount: activeClients.length,
        totalRevenue: activeClients.length * product.price,
      };
    });
    
    return stats;
  }, [products, clients]);

  const chartData = useMemo(() => {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      totalRevenue: productStatsMap[p.id]?.totalRevenue || 0
    }));
  }, [products, productStatsMap]);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 uppercase text-xs tracking-widest">
          <PlusCircleIcon className="w-5 h-5" />
          Aggiungi Prodotto
        </button>
      </div>
      
      <ProductBarChart data={chartData} />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const stats = productStatsMap[product.id] || { clientCount: 0, totalRevenue: 0 };
            return (
              <ProductCard
                key={product.id}
                product={product}
                clientCount={stats.clientCount}
                totalRevenue={stats.totalRevenue}
                onEdit={setEditingProduct}
                onDelete={onDeleteProduct}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100 px-6">
            <div className="bg-slate-50 text-slate-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Listino vuoto</h2>
            <p className="mt-2 text-slate-400 font-medium text-sm">Crea il tuo primo prodotto o servizio per iniziare la vendita.</p>
            <button onClick={() => setAddModalOpen(true)} className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest">
                <PlusCircleIcon className="w-5 h-5" />
                Inizia ora
            </button>
        </div>
      )}

      {isAddModalOpen && <AddProductForm onAddProduct={onAddProduct} onClose={() => setAddModalOpen(false)} />}
      {editingProduct && <EditProductForm product={editingProduct} onUpdateProduct={onUpdateProduct} onClose={() => setEditingProduct(null)} />}
    </div>
  );
};

export default ProdottiPage;