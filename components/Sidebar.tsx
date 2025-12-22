import React from 'react';
import { DashboardIcon, UsersIcon, BriefcaseIcon, PackageIcon, BarChartIcon, CalculatorIcon, XIcon } from './Icons';
import { supabase } from '../lib/supabase';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const handleLogout = async () => {
    if (window.confirm('Vuoi uscire dal sistema?')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/40">
           <span className="font-bold text-lg">C</span>
        </div>
        <span className="text-2xl font-black tracking-tight">CRM DASH</span>
      </div>
      
      <nav className="flex-1 flex flex-col space-y-1">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          isActive={currentView === 'dashboard'}
          onClick={() => setCurrentView('dashboard')}
        />
        <NavItem
          icon={<UsersIcon className="w-6 h-6" />}
          label="Clienti"
          isActive={currentView === 'clients'}
          onClick={() => setCurrentView('clients')}
        />
        <NavItem
          icon={<BriefcaseIcon className="w-6 h-6" />}
          label="Venditori"
          isActive={currentView === 'sellers'}
          onClick={() => setCurrentView('sellers')}
        />
        <NavItem
          icon={<PackageIcon className="w-6 h-6" />}
          label="Prodotti"
          isActive={currentView === 'products'}
          onClick={() => setCurrentView('products')}
        />
        <NavItem
          icon={<BarChartIcon className="w-6 h-6" />}
          label="Report Vendite"
          isActive={currentView === 'reports'}
          onClick={() => setCurrentView('reports')}
        />
         <NavItem
          icon={<CalculatorIcon className="w-6 h-6" />}
          label="Business"
          isActive={currentView === 'business'}
          onClick={() => setCurrentView('business')}
        />
      </nav>

      <div className="pt-6 border-t border-gray-800 mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="ml-3">Esci</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;