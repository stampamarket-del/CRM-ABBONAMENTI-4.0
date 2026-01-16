import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Client, Product, Seller, Project, Task } from './types';
import ClientList from './components/ClientList';
import AddClientForm from './components/AddClientForm';
import EditClientForm from './components/EditClientForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProdottiPage from './pages/ProdottiPage';
import VenditoriPage from './pages/VenditoriPage';
import ReportsPage from './pages/ReportsPage';
import BusinessPage from './pages/BusinessPage';
import ProgettiPage from './pages/ProgettiPage';
import { PlusCircleIcon, UploadIcon, XIcon } from './components/Icons';
import ImportClientModal from './components/ImportClientModal';
import ClientFilterBar from './components/ClientFilterBar';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business' | 'projects';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterSubscriptionType, setFilterSubscriptionType] = useState('');
  const [sortOrder, setSortOrder] = useState('expiry_desc');

  // Check initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const [pRes, sRes, cRes, prRes, tRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('sellers').select('*').order('name'),
        supabase.from('clients').select('*'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*')
      ]);

      if (pRes.data) setProducts(pRes.data);
      if (sRes.data) setSellers(sRes.data);
      if (cRes.data) setClients(cRes.data);
      if (prRes.data) setProjects(prRes.data);
      if (tRes.data) setTasks(tRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client CRUD
  const addClient = async (client: Omit<Client, 'id'>) => {
    const { data, error } = await supabase.from('clients').insert([client]).select();
    if (error) { alert('Errore: ' + error.message); return; }
    if (data) setClients(prev => [...prev, data[0]]);
  };

  const deleteClient = async (clientId: string) => {
    if (!window.confirm('Eliminare il cliente?')) return;
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) { alert('Errore: ' + error.message); return; }
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const updateClient = async (updatedClient: Client) => {
    const { error } = await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id);
    if (error) { alert('Errore: ' + error.message); return; }
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setEditingClient(null);
  };

  // Project CRUD
  const addProject = async (project: Omit<Project, 'id'>) => {
    const { data, error } = await supabase.from('projects').insert([project]).select();
    if (error) { alert('Errore: ' + error.message); return; }
    if (data) setProjects(prev => [data[0], ...prev]);
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Eliminare il progetto?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { alert('Errore: ' + error.message); return; }
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
  };

  const updateProject = async (updatedProject: Project) => {
    const { error } = await supabase.from('projects').update(updatedProject).eq('id', updatedProject.id);
    if (error) { alert('Errore: ' + error.message); return; }
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  // Task CRUD
  const addTask = async (task: Omit<Task, 'id'>) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) { alert('Errore: ' + error.message); return; }
    if (data) setTasks(prev => [...prev, data[0]]);
  };

  const updateTask = async (updatedTask: Task) => {
    const { error } = await supabase.from('tasks').update(updatedTask).eq('id', updatedTask.id);
    if (error) { alert('Errore: ' + error.message); return; }
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) { alert('Errore: ' + error.message); return; }
    setTasks(prev => prev.filter(t => t.id !== taskId));
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
      case 'projects': return (
        <ProgettiPage 
          projects={projects} 
          clients={clients} 
          tasks={tasks}
          onAddProject={addProject} 
          onUpdateProject={updateProject} 
          onDeleteProject={deleteProject}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      );
      case 'sellers': return <VenditoriPage sellers={sellers} onAddSeller={async s => { const { data } = await supabase.from('sellers').insert([s]).select(); if (data) setSellers(prev => [...prev, data[0]]); }} onUpdateSeller={async s => { await supabase.from('sellers').update(s).eq('id', s.id); setSellers(prev => prev.map(old => old.id === s.id ? s : old)); }} onDeleteSeller={async id => { await supabase.from('sellers').delete().eq('id', id); setSellers(prev => prev.filter(s => s.id !== id)); }} clients={clients} products={products} />;
      case 'products': return <ProdottiPage products={products} onAddProduct={async p => { const { data } = await supabase.from('products').insert([p]).select(); if (data) setProducts(prev => [...prev, data[0]]); }} onUpdateProduct={async p => { await supabase.from('products').update(p).eq('id', p.id); setProducts(prev => prev.map(old => old.id === p.id ? p : old)); }} onDeleteProduct={async id => { await supabase.from('products').delete().eq('id', id); setProducts(prev => prev.filter(p => p.id !== id)); }} clients={clients} />;
      case 'reports': return <ReportsPage clients={clients} products={products} sellers={sellers} />;
      case 'business': return <BusinessPage />;
      default: return null;
    }
  })();

  const viewTitles: Record<View, string> = {
      dashboard: 'Panoramica',
      clients: 'Anagrafica Clienti',
      sellers: 'Rete Venditori',
      products: 'Listino Prodotti',
      reports: 'Performance & Report',
      business: 'Business Intelligence',
      projects: 'Gestione Progetti'
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden relative">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-white/80 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-10 px-4 sm:px-12 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-7xl mx-auto w-full gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase">{viewTitles[currentView]}</h1>
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            {currentView === 'clients' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => setImportModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-500 font-black py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all text-[10px] sm:text-xs tracking-widest uppercase">
                  <UploadIcon className="w-4 h-4" /> <span className="hidden xs:inline">Importa</span>
                </button>
                <button onClick={() => setAddClientModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 text-white font-black py-2.5 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all text-[10px] sm:text-xs tracking-widest uppercase">
                  <PlusCircleIcon className="w-4 h-4 sm:w-5 h-5" /> <span className="hidden xs:inline">Nuovo Cliente</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-12 py-6 sm:py-10">
          <div className="max-w-7xl mx-auto">{mainContent}</div>
        </main>
      </div>
      {isAddClientModalOpen && <AddClientForm onAddClient={addClient} onClose={() => setAddClientModalOpen(false)} products={products} sellers={sellers} />}
      {editingClient && <EditClientForm client={editingClient} onUpdateClient={updateClient} onClose={() => setEditingClient(null)} products={products} sellers={sellers} />}
      {isImportModalOpen && <ImportClientModal onClose={() => setImportModalOpen(false)} onImport={async (c) => { await supabase.from('clients').insert(c); fetchData(); }} products={products} sellers={sellers} />}
    </div>
  );
};

export default App;