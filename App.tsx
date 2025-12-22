
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
import { supabase, checkConnection } from './lib/supabase';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; error?: string; message?: string } | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState('');
  const [sortOrder, setSortOrder] = useState('expiry_desc');

  // Monitoraggio Sessione Auth e Test Connessione
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const status = await checkConnection();
        setDbStatus(status);
      }
      
      setAuthLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkConnection().then(setDbStatus);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
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
      setClients(clientsData || []);
      setProducts(productsData || []);
      setSellers(sellersData || []);
      setDbStatus({ ok: true });
    } catch (err: any) {
      console.error('Fetch Error:', err);
      if (err.message?.includes('API key') || err.code === '401') {
        setDbStatus({ ok: false, error: 'INVALID_KEY', message: 'La chiave API di Supabase non è valida.' });
      } else {
        setDbStatus({ ok: false, error: 'DB_ERROR', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && dbStatus?.ok) {
      fetchData();
    }
  }, [session, dbStatus?.ok, fetchData]);

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

  // FIX: Implemented missing seller management functions to resolve compilation errors
  const addSeller = async (seller: Omit<Seller, 'id'>) => {
    const { data, error } = await supabase.from('sellers').insert([seller]).select();
    if (error) alert('Errore: ' + error.message);
    else if (data) setSellers(prev => [...prev, data[0]]);
  };

  const updateSeller = async (updatedSeller: Seller) => {
    const { error } = await supabase.from('sellers').update(updatedSeller).eq('id', updatedSeller.id);
    if (error) alert('Errore: ' + error.message);
    else {
      setSellers(prev => prev.map(s => s.id === updatedSeller.id ? updatedSeller : s));
    }
  };

  const deleteSeller = async (sellerId: string) => {
    if (!window.confirm('Eliminare il venditore?')) return;
    const { error } = await supabase.from('sellers').delete().eq('id', sellerId);
    if (error) alert('Errore: ' + error.message);
    else setSellers(prev => prev.filter(s => s.id !== sellerId));
  };

  const filteredAndSortedClients = useMemo(() => {
    return clients.filter(c => {
      const search = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(search) || c.surname.toLowerCase().includes(search) || c.email.toLowerCase().includes(search);
    });
  }, [clients, searchTerm]);

  if (authLoading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent shadow-2xl mb-4"></div>
      <p className="text-blue-400 font-bold tracking-widest animate-pulse">CARICAMENTO CRM...</p>
    </div>
  );

  if (!session) return <Auth onSuccess={() => {}} />;

  const mainContent = (() => {
    if (dbStatus && !dbStatus.ok) {
      return (
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-red-50 text-center">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertTriangleIcon className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {dbStatus.error === 'INVALID_KEY' ? 'Chiave API Errata' : 'Errore Database'}
            </h2>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed italic px-6">
              {dbStatus.error === 'INVALID_KEY' 
                ? 'La Anon Key inserita in lib/supabase.ts non è valida. Assicurati di aver copiato la chiave corretta dalla dashboard di Supabase.'
                : dbStatus.message || 'Errore imprevisto di connessione.'}
            </p>
            <div className="grid gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 text-lg"
              >
                Riprova Connessione
              </button>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Disconnetti Account
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-widest">
              Codice Errore: {dbStatus.error}
            </div>
          </div>
        </div>
      );
    }

    if (loading) return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mb-6"></div>
        <p className="text-slate-400 font-bold italic text-xl animate-pulse">Sincronizzazione dati...</p>
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
      case 'products': return <ProdottiPage products={products} onAddProduct={(p) => { supabase.from('products').insert([p]).then(fetchData) }} onUpdateProduct={(p) => { supabase.from('products').update(p).eq('id', p.id).then(fetchData) }} onDeleteProduct={(id) => { supabase.from('products').delete().eq('id', id).then(fetchData) }} clients={clients} />;
      case 'reports': return <ReportsPage clients={clients} products={products} sellers={sellers} />;
      case 'business': return <BusinessPage />;
      default: return null;
    }
  })();

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col relative">
        <header className="bg-white/70 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-10 px-10 py-8">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
                {currentView === 'clients' ? 'Anagrafica' : currentView}
              </h1>
              <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest opacity-80">Gestione Professionale Abbonamenti</p>
            </div>
            {currentView === 'clients' && dbStatus?.ok && (
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
      {isImportModalOpen && <ImportClientModal onClose={() => setImportModalOpen(false)} onImport={(c) => { supabase.from('clients').insert(c).then(() => fetchData()) }} products={products} sellers={sellers} />}
    </div>
  );
};

export default App;
