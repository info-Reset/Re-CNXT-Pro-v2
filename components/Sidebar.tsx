
import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'clients' | 'projects' | 'settings' | 'prospector';
  onTabChange: (tab: 'dashboard' | 'clients' | 'projects' | 'settings' | 'prospector') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'clients', label: 'CRM / Leads', icon: 'fa-users' },
    { id: 'prospector', label: 'AI Prospector', icon: 'fa-binoculars' },
    { id: 'projects', label: 'Task Board', icon: 'fa-columns' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 bg-slate-950 text-white h-full shadow-2xl border-r border-white/5">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-layer-group text-lg"></i>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight">RE:CNXT PRO</h1>
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Agency OS</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 mt-4 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-sm transition-transform group-hover:scale-110`}></i>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/2 mt-auto">
        <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Profile" 
            className="rounded-xl w-10 h-10 bg-indigo-900 shadow-inner"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Alex M.</p>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-wider">Pro Account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
