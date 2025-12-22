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

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState('');
  const [sortOrder, setSortOrder] = useState('expiry_desc');

  // Auth monitoring
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
      // Note: We use try-catch to catch network errors before they hit the [object Object] console log issue
      const [
        { data: clientsData, error: clientsError },
        { data: productsData, error: productsError },
        { data: sellersData, error: sellersError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('products').select('*'),
        supabase.from('sellers').select('*')
      ]);

      if (clientsError) throw new Error(`Clienti: ${clientsError.message}`);
      if (productsError) throw new Error(`Prodotti: ${productsError.message}`);
      if (sellersError) throw new Error(`Venditori: ${sellersError.message}`);

      setClients(clientsData || []);
      setProducts(productsData || []);
      setSellers(sellersData || []);
    } catch (err: any) {
      console.error('Database connection error:', err.message || err);
      // Detailed error for common Supabase failures
      let msg = err.message || 'Errore imprevisto di rete';
      if (msg.includes('Failed to fetch')) {
        msg = 'Impossibile contattare il server Supabase. Verifica la connessione o l\'URL del progetto.';
      } else if (msg.includes('Invalid API key')) {
        msg = 'Chiave API non valida. Verifica la Anon Key nel file lib/supabase.ts.';
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

  const addClient = useCallback(async (client: Omit<Client, 'id'>) => {
    const { data, error } = await supabase.from('clients').insert([client]).select();
    if (error) {
      alert('Errore durante il salvataggio del cliente: ' + error.message);
    } else if (data) {
      setClients(prev => [...prev, data[0]]);
    }
  }, []);
  
  const importClients = useCallback(async (newClients: Omit<Client, 'id'>[]) => {
    const { data, error } = await supabase.from('clients').insert(newClients).select();
    if (error) {
      alert('Errore durante l\'importazione: ' + error.message);
    } else if (data) {
      setClients(prev => [...prev, ...data]);
      alert(`${data.length} clienti importati con successo!`);
    }
  }, []);

  const deleteClient = useCallback(async (clientId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
    } else {
      setClients(prev => prev.filter(client => client.id !== clientId));
    }
  }, []);

  const updateClient = useCallback(async (updatedClient: Client) => {
    const { error } = await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id);
    if (error) {
      alert('Errore durante l\'aggiornamento: ' + error.message);
    } else {
      setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client));
      setEditingClient(null);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) {
      alert('Errore: ' + error.message);
    } else if (data) {
      setProducts(prev => [...prev, data[0]]);
    }
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        alert('Errore: ' + error.message);
      } else {
        setProducts(prev => prev.filter(product => product.id !== productId));
        setClients(prev => prev.map(client => 
          client.productId === productId ? { ...client, productId: undefined } : client
        ));
      }
    }
  }, []);

  const addSeller = useCallback(async (seller: Omit<Seller, 'id'>) => {
    const { data, error } = await supabase.from('sellers').insert([seller]).select();
    if (error) {
      alert('Errore: ' + error.message);
    } else if (data) {
      setSellers(prev => [...prev, data[0]]);
    }
  }, []);

  const updateSeller = useCallback(async (updatedSeller: Seller) => {
    const { error } = await supabase.from('sellers').update(updatedSeller).eq('id', updatedSeller.id);
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      setSellers(prev => prev.map(s => s.id === updatedSeller.id ? updatedSeller : s));
    }
  }, []);

  const deleteSeller = useCallback(async (sellerId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo venditore?')) {
      const { error } = await supabase.from('sellers').delete().eq('id', sellerId);
      if (error) {
        alert('Errore: ' + error.message);
      } else {
        setSellers(prev => prev.filter(seller => seller.id !== sellerId));
        setClients(prev => prev.map(client => 
          client.sellerId === sellerId ? { ...client, sellerId: undefined } : client
        ));
      }
    }
  }, []);
  
  const handleExportClients = useCallback(() => {
    // CSV Export logic
    const sortedClients = [...clients].sort((a, b) => new Date(a.subscription.endDate).getTime() - new Date(b.subscription.endDate).getTime());
    const dataToExport = sortedClients.map(client => {
      const product = products.find(p => p.id === client.productId);
      const seller = sellers.find(s => s.id === client.sellerId);
      return {
        'Nome': client.name,
        'Cognome': client.surname,
        'Email': client.email,
        'Prodotto': product ? product.name : 'N/D',
        'Fine Abbonamento': new Date(client.subscription.endDate).toLocaleDateString('it-IT'),
      };
    });
    
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clienti_crm.csv';
    link.click();
  }, [clients, products, sellers]);

  const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    clients: 'Gestione Clienti',
    sellers: 'Area Venditori',
    products: 'Catalogo Prodotti',
    reports: 'Report & Statistiche',
    business: 'Calcolatore Business',
  };
  
  const filteredAndSortedClients = useMemo(() => {
    let result = clients.filter(client => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTermLower === '' ||
        client.name.toLowerCase().includes(searchTermLower) ||
        client.surname.toLowerCase().includes(searchTermLower) ||
        client.email.toLowerCase().includes(searchTermLower);

      const matchesProduct = filterProductId === '' || client.productId === filterProductId;
      const matchesSeller = filterSellerId === '' || client.sellerId === filterSellerId;
      const matchesSubscriptionType = filterSubscriptionType === '' || client.subscriptionType === filterSubscriptionType;

      return matchesSearch && matchesProduct && matchesSeller && matchesSubscriptionType;
    });

    switch (sortOrder) {
      case 'expiry_asc':
        result.sort((a, b) => new Date(a.subscription.endDate).getTime() - new Date(b.subscription.endDate).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`));
        break;
      case 'expiry_desc':
      default:
        result.sort((a, b) => new Date(b.subscription.endDate).getTime() - new Date(a.subscription.endDate).getTime());
        break;
    }
    return result;
  }, [clients, searchTerm, filterProductId, filterSellerId, filterSubscriptionType, sortOrder]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-xl"></div>
          <p className="mt-4 text-blue-400 font-bold tracking-widest animate-pulse">AUTENTICAZIONE...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  const mainContent = (() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-500 font-semibold italic text-lg">Sincronizzazione Cloud in corso...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white p-10 rounded-3xl border border-red-100 text-center max-w-lg shadow-2xl">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Connessione Fallita</h2>
            <p className="text-gray-600 mb-8 leading-relaxed font-medium italic">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 text-lg"
            >
              Riconnetti Ora
            </button>
            <p className="mt-6 text-xs text-gray-400 font-medium">
              Nota: Assicurati di aver configurato correttamente Supabase.
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard clients={clients} products={products} />;
      case 'clients':
        return (
          <>
            <ClientFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterProductId={filterProductId}
              setFilterProductId={setFilterProductId}
              filterSellerId={filterSellerId}
              setFilterSellerId={setFilterSellerId}
              filterSubscriptionType={filterSubscriptionType}
              setFilterSubscriptionType={setFilterSubscriptionType}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              products={products}
              sellers={sellers}
            />
            <ClientList 
              clients={filteredAndSortedClients} 
              totalClientsCount={clients.length}
              onDeleteClient={deleteClient} 
              onEditClient={setEditingClient} 
              products={products} 
              sellers={sellers} 
            />
          </>
        );
      case 'sellers':
        return <VenditoriPage sellers={sellers} onAddSeller={addSeller} onUpdateSeller={updateSeller} onDeleteSeller={deleteSeller} clients={clients} products={products} />;
      case 'products':
        return <ProdottiPage products={products} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} clients={clients} />;
       case 'reports':
        return <ReportsPage clients={clients} products={products} sellers={sellers} />;
      case 'business':
        return <BusinessPage />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{viewTitles[currentView]}</h1>
            {currentView === 'clients' && !error && (
              <div className="flex items-center gap-3">
                 <button
                    onClick={() => setImportModalOpen(true)}
                    className="flex items-center gap-2 bg-purple-50 text-purple-700 font-bold py-2.5 px-5 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all duration-300"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Importa
                </button>
                 <button
                    onClick={handleExportClients}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2.5 px-5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all duration-300"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Esporta
                </button>
                <button
                  onClick={() => setAddClientModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Nuovo Cliente
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC]">
          <div className="container mx-auto px-6 py-10">
            {mainContent}
          </div>
        </main>
      </div>
      {isAddClientModalOpen && (
        <AddClientForm
          onAddClient={addClient}
          onClose={() => setAddClientModalOpen(false)}
          products={products}
          sellers={sellers}
        />
      )}
      {editingClient && (
        <EditClientForm
          client={editingClient}
          onUpdateClient={updateClient}
          onClose={() => setEditingClient(null)}
          products={products}
          sellers={sellers}
        />
      )}
       {isImportModalOpen && (
        <ImportClientModal
            onClose={() => setImportModalOpen(false)}
            onImport={importClients}
            products={products}
            sellers={sellers}
        />
      )}
    </div>
  );
};

export default App;