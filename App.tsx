
import React, { useState, useEffect } from 'react';
import { Client } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ProjectBoard from './components/ProjectBoard';
import ClientDetailView from './components/ClientDetailView';
import Settings from './components/Settings';
import Login from './components/Login';
import Prospector from './components/Prospector';
import { StorageService } from './services/storageService';

const AUTH_KEY = 'recnxt_auth_session';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'projects' | 'settings' | 'prospector'>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth and load data on mount
  useEffect(() => {
    const session = localStorage.getItem(AUTH_KEY);
    const masterKey = process.env.APP_ACCESS_KEY || 'admin123';
    
    if (session === masterKey) {
      setIsAuthenticated(true);
    }
    
    const data = StorageService.getClients();
    setClients(data);
    setIsLoading(false);
  }, []);

  const handleLogin = (key: string) => {
    localStorage.setItem(AUTH_KEY, key);
    setIsAuthenticated(true);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const newClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(newClients);
    StorageService.saveClients(newClients);
    
    if (selectedClient?.id === updatedClient.id) {
      setSelectedClient(updatedClient);
    }
  };

  const handleAddClient = (newClient: Client) => {
    const newClients = [...clients, newClient];
    setClients(newClients);
    StorageService.saveClients(newClients);
  };

  const handleDeleteClient = (clientId: string) => {
    const newClients = clients.filter(c => c.id !== clientId);
    setClients(newClients);
    StorageService.saveClients(newClients);
    setSelectedClient(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-bold tracking-widest text-xs uppercase">Initializing Re:CNXT...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
        {selectedClient ? (
          <ClientDetailView 
            client={selectedClient} 
            onBack={() => setSelectedClient(null)} 
            onUpdate={handleUpdateClient}
            onDelete={() => handleDeleteClient(selectedClient.id)}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeTab === 'dashboard' && (
              <Dashboard clients={clients} onSelectClient={setSelectedClient} />
            )}
            {activeTab === 'clients' && (
              <ClientList 
                clients={clients} 
                onSelectClient={setSelectedClient}
                onAddClient={handleAddClient}
              />
            )}
            {activeTab === 'prospector' && (
              <Prospector onAddLead={handleAddClient} />
            )}
            {activeTab === 'projects' && (
              <ProjectBoard clients={clients} />
            )}
            {activeTab === 'settings' && (
              <Settings />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
