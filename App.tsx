
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Client, Product, Seller } from './types';
import ClientList from './components/ClientList';
import AddClientForm from './components/AddClientForm';
import EditClientForm from './components/EditClientForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProdottiPage from './pages/ProdottiPage';
import VenditoriPage from './pages/VenditoriPage';
import ReportsPage from './pages/ReportsPage';
import BusinessPage from './pages/BusinessPage';
import { PlusCircleIcon, UploadIcon } from './components/Icons';
import ImportClientModal from './components/ImportClientModal';
import ClientFilterBar from './components/ClientFilterBar';
import Auth from './components/Auth';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business';

const App: React.FC = () => {
  // Authentication State (Local)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('crm_is_authenticated') === 'true';
  });

  // Local Data State
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('crm_clients');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('crm_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('crm_sellers');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState('');
  const [sortOrder, setSortOrder] = useState('expiry_desc');

  // Persistence
  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('crm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('crm_sellers', JSON.stringify(sellers));
  }, [sellers]);

  // CRUD Operations
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: crypto.randomUUID() };
    setClients(prev => [...prev, newClient]);
  };

  const deleteClient = (clientId: string) => {
    if (!window.confirm('Eliminare il cliente?')) return;
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setEditingClient(null);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: crypto.randomUUID() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    if (!window.confirm('Eliminare il prodotto?')) return;
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addSeller = (seller: Omit<Seller, 'id'>) => {
    const newSeller = { ...seller, id: crypto.randomUUID() };
    setSellers(prev => [...prev, newSeller]);
  };

  const updateSeller = (updatedSeller: Seller) => {
    setSellers(prev => prev.map(s => s.id === updatedSeller.id ? updatedSeller : s));
  };

  const deleteSeller = (sellerId: string) => {
    if (!window.confirm('Eliminare il venditore?')) return;
    setSellers(prev => prev.filter(s => s.id !== sellerId));
  };

  const filteredAndSortedClients = useMemo(() => {
    return clients.filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(search) || 
                          c.surname.toLowerCase().includes(search) || 
                          c.email.toLowerCase().includes(search);
      const matchesProduct = filterProductId ? c.productId === filterProductId : true;
      const matchesSeller = filterSellerId ? c.sellerId === filterSellerId : true;
      const matchesType = filterSubscriptionType ? c.subscriptionType === filterSubscriptionType : true;
      
      return matchesSearch && matchesProduct && matchesSeller && matchesType;
    }).sort((a, b) => {
      if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'expiry_asc') return new Date(a.subscription.endDate).getTime() - new Date(b.subscription.endDate).getTime();
      return new Date(b.subscription.endDate).getTime() - new Date(a.subscription.endDate).getTime();
    });
  }, [clients, searchTerm, filterProductId, filterSellerId, filterSubscriptionType, sortOrder]);

  const handleLogout = () => {
    localStorage.removeItem('crm_is_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onSuccess={() => setIsAuthenticated(true)} />;
  }

  const mainContent = (() => {
    switch (currentView) {
      case 'dashboard': return <Dashboard clients={clients} products={products} />;
      case 'clients': return (
        <>
          <ClientFilterBar 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
            filterProductId={filterProductId} setFilterProductId={setFilterProductId}
            filterSellerId={filterSellerId} setFilterSellerId={setFilterSellerId}
            filterSubscriptionType={filterSubscriptionType} setFilterSubscriptionType={setFilterSubscriptionType}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            products={products} sellers={sellers}
          />
          <ClientList 
            clients={filteredAndSortedClients} totalClientsCount={clients.length}
            onDeleteClient={deleteClient} onEditClient={setEditingClient} 
            products={products} sellers={sellers} 
          />
        </>
      );
      case 'sellers': return <VenditoriPage sellers={sellers} onAddSeller={addSeller} onUpdateSeller={updateSeller} onDeleteSeller={deleteSeller} clients={clients} products={products} />;
      case 'products': return <ProdottiPage products={products} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} clients={clients} />;
      case 'reports': return <ReportsPage clients={clients} products={products} sellers={sellers} />;
      case 'business': return <BusinessPage />;
      default: return null;
    }
  })();

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col relative">
        <header className="bg-white/70 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-10 px-10 py-8">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
                {currentView === 'clients' ? 'Anagrafica' : currentView}
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest opacity-80">Gestione Locale Abbonamenti</p>
            </div>
            {currentView === 'clients' && (
              <div className="flex items-center gap-4">
                <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 bg-slate-100 text-slate-600 font-bold py-3 px-6 rounded-2xl hover:bg-slate-200 transition-all">
                  <UploadIcon className="w-5 h-5" /> Importa
                </button>
                <button onClick={() => setAddClientModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0">
                  <PlusCircleIcon className="w-6 h-6" /> Nuovo Cliente
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {mainContent}
          </div>
        </main>
      </div>
      {isAddClientModalOpen && <AddClientForm onAddClient={addClient} onClose={() => setAddClientModalOpen(false)} products={products} sellers={sellers} />}
      {editingClient && <EditClientForm client={editingClient} onUpdateClient={updateClient} onClose={() => setEditingClient(null)} products={products} sellers={sellers} />}
      {isImportModalOpen && <ImportClientModal onClose={() => setImportModalOpen(false)} onImport={(c) => { setClients(prev => [...prev, ...c.map(client => ({...client, id: crypto.randomUUID()}))]) }} products={products} sellers={sellers} />}
    </div>
  );
};

export default App;
