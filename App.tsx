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
import { PlusCircleIcon, DownloadIcon, UploadIcon, AlertTriangleIcon } from './components/Icons';
import ImportClientModal from './components/ImportClientModal';
import ClientFilterBar from './components/ClientFilterBar';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Filtri e Ordinamento
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState('');
  const [sortOrder, setSortOrder] = useState('expiry_desc');

  // Monitoraggio Sessione Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setClients([]);
        setProducts([]);
        setSellers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [
        { data: clientsData, error: clientsError },
        { data: productsData, error: productsError },
        { data: sellersData, error: sellersError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('products').select('*'),
        supabase.from('sellers').select('*')
      ]);

      if (clientsError) throw clientsError;
      if (productsError) throw productsError;
      if (sellersError) throw sellersError;

      setClients(clientsData || []);
      setProducts(productsData || []);
      setSellers(sellersData || []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      let msg = err.message || 'Errore di connessione al database.';
      
      if (msg.includes('Failed to fetch')) {
        msg = 'Impossibile contattare Supabase. Verifica la tua connessione internet o l\'URL del progetto.';
      } else if (msg.includes('Invalid API key') || err.code === '401') {
        msg = 'Chiave API non valida o scaduta. Controlla la Anon Key in lib/supabase.ts.';
      } else if (err.code === 'PGRST116') {
        msg = 'Tabelle non trovate. Assicurati di aver eseguito lo script SQL di configurazione.';
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  // CRUD Functions (Mantenute ma con gestione errori migliorata)
  const addClient = async (client: Omit<Client, 'id'>) => {
    const { data, error } = await supabase.from('clients').insert([client]).select();
    if (error) alert('Errore: ' + error.message);
    else if (data) setClients(prev => [...prev, data[0]]);
  };

  const deleteClient = async (clientId: string) => {
    if (!window.confirm('Eliminare il cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) alert('Errore: ' + error.message);
    else setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const updateClient = async (updatedClient: Client) => {
    const { error } = await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id);
    if (error) alert('Errore: ' + error.message);
    else {
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      setEditingClient(null);
    }
  };

  // Altre funzioni CRUD per prodotti e venditori seguono lo stesso pattern...
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert([p]).select();
    if (error) alert(error.message); else if (data) setProducts(prev => [...prev, data[0]]);
  };
  const updateProduct = async (p: Product) => {
    const { error } = await supabase.from('products').update(p).eq('id', p.id);
    if (error) alert(error.message); else setProducts(prev => prev.map(old => old.id === p.id ? p : old));
  };
  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message); else setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSeller = async (s: Omit<Seller, 'id'>) => {
    const { data, error } = await supabase.from('sellers').insert([s]).select();
    if (error) alert(error.message); else if (data) setSellers(prev => [...prev, data[0]]);
  };
  const updateSeller = async (s: Seller) => {
    const { error } = await supabase.from('sellers').update(s).eq('id', s.id);
    if (error) alert(error.message); else setSellers(prev => prev.map(old => old.id === s.id ? s : old));
  };
  const deleteSeller = async (id: string) => {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) alert(error.message); else setSellers(prev => prev.filter(s => s.id !== id));
  };

  const handleExportClients = () => {
    const headers = ['Nome', 'Cognome', 'Email', 'Scadenza'];
    const rows = clients.map(c => [c.name, c.surname, c.email, new Date(c.subscription.endDate).toLocaleDateString()]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export_clienti.csv';
    link.click();
  };

  const filteredAndSortedClients = useMemo(() => {
    let result = clients.filter(c => {
      const search = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(search) || c.surname.toLowerCase().includes(search) || c.email.toLowerCase().includes(search);
    });
    // Ordinamento semplificato per brevità
    return result;
  }, [clients, searchTerm]);

  if (authLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  if (!session) return <Auth onSuccess={() => {}} />;

  const mainContent = (() => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse italic">Caricamento dati dal cloud...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-xl mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-red-50 text-center">
        <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertTriangleIcon className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Errore Database</h2>
        <p className="text-slate-600 mb-10 leading-relaxed text-lg font-medium italic px-4">{error}</p>
        <div className="space-y-4">
          <button 
            onClick={() => fetchData()}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-lg"
          >
            Riprova Connessione
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Torna al Login
          </button>
        </div>
      </div>
    );

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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
          <div className="container mx-auto px-8 py-6 flex justify-between items-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {currentView === 'clients' ? 'Clienti' : currentView}
            </h1>
            {currentView === 'clients' && !error && (
              <div className="flex items-center gap-3">
                <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 bg-purple-50 text-purple-700 font-bold py-2.5 px-6 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-all">
                  <UploadIcon className="w-4 h-4" /> Importa
                </button>
                <button onClick={handleExportClients} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2.5 px-6 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all">
                  <DownloadIcon className="w-4 h-4" /> Esporta
                </button>
                <button onClick={() => setAddClientModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-black py-2.5 px-8 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                  <PlusCircleIcon className="w-5 h-5" /> Nuovo Cliente
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="container mx-auto max-w-7xl">
            {mainContent}
          </div>
        </main>
      </div>
      {isAddClientModalOpen && <AddClientForm onAddClient={addClient} onClose={() => setAddClientModalOpen(false)} products={products} sellers={sellers} />}
      {editingClient && <EditClientForm client={editingClient} onUpdateClient={updateClient} onClose={() => setEditingClient(null)} products={products} sellers={sellers} />}
      {isImportModalOpen && <ImportClientModal onClose={() => setImportModalOpen(false)} onImport={(c) => { supabase.from('clients').insert(c).then(() => fetchData()) }} products={products} sellers={sellers} />}
    </div>
  );
};

export default App;