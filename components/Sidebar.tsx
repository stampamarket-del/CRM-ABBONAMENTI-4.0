
import React from 'react';
import { DashboardIcon, UsersIcon, BriefcaseIcon, PackageIcon, BarChartIcon, CalculatorIcon, XIcon } from './Icons';

type View = 'dashboard' | 'clients' | 'sellers' | 'products' | 'reports' | 'business';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/40">
           <span className="font-bold text-lg text-white">C</span>
        </div>
        <span className="text-xl font-black tracking-tight uppercase">CRM PROFESSIONAL</span>
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
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-all"
        >
          <XIcon className="w-5 h-5 rotate-45" />
          <span className="ml-3">Disconnetti</span>
        </button>
        <div className="px-4 py-3 text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center mt-2">
          Versione Offline 2.5
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
