
import React, { useState, useEffect } from 'react';
import { WorkspaceConfig } from '../types';
import { GoogleWorkspaceService } from '../services/googleService';

const WorkspaceSettings: React.FC = () => {
  const [config, setConfig] = useState<WorkspaceConfig>(() => {
    const saved = localStorage.getItem('recnxt_workspace_config');
    return saved ? JSON.parse(saved) : {
      spreadsheetId: '',
      rootFolderId: '',
      isConnected: false,
      lastSync: null,
      userEmail: null
    };
  });

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    localStorage.setItem('recnxt_workspace_config', JSON.stringify(config));
  }, [config]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await GoogleWorkspaceService.connect();
      setConfig(prev => ({ ...prev, isConnected: true, lastSync: new Date().toISOString() }));
    } catch (err) {
      console.error(err);
      alert("Connection failed. Please ensure your Google Client ID is valid in googleService.ts");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleIdInput = (field: 'spreadsheetId' | 'rootFolderId', value: string) => {
    const id = GoogleWorkspaceService.extractIdFromUrl(value);
    setConfig(prev => ({ ...prev, [field]: id }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cloud Infrastructure</h2>
        <p className="text-slate-500 font-medium">Powering your CRM with Google Drive & Sheets as a free backend.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Authentication Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl border border-indigo-100">
              <i className="fab fa-google"></i>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
              {config.isConnected ? 'Bridge Active' : 'Offline'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Workspace Auth</h3>
          <p className="text-xs text-slate-500 mb-8 leading-relaxed">Connect your account to enable real-time syncing of client data and project folders.</p>

          {!config.isConnected ? (
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center uppercase tracking-widest text-xs"
            >
              {isConnecting ? <i className="fas fa-spinner animate-spin mr-2"></i> : <i className="fas fa-link mr-2"></i>}
              Authorize Workspace
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Handshake</p>
                <p className="text-sm font-bold text-slate-700">{config.lastSync ? new Date(config.lastSync).toLocaleString() : 'Never'}</p>
              </div>
              <button 
                onClick={() => setConfig({...config, isConnected: false})}
                className="w-full border border-slate-200 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest"
              >
                Terminate Connection
              </button>
            </div>
          )}
        </div>

        {/* Configuration Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100">
              <i className="far fa-file-excel"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Database Engine</h3>
              <p className="text-xs text-slate-500">Mapping Google IDs</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">Spreadsheet URL / ID</label>
              <input 
                type="text" 
                placeholder="Paste Master Sheet URL..." 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-700"
                value={config.spreadsheetId}
                onChange={(e) => handleIdInput('spreadsheetId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">Root Folder URL / ID</label>
              <input 
                type="text" 
                placeholder="Paste Drive Folder URL..." 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-700"
                value={config.rootFolderId}
                onChange={(e) => handleIdInput('rootFolderId', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
          <i className="fas fa-server text-9xl"></i>
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-black mb-6 tracking-tight">The "Serverless" Secret</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Because GitHub Pages doesn't offer a database, your app creates its own bridge to Google. 
              Your data never touches a 3rd party server—it goes directly from your browser to your Google account.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <i className="fas fa-check-circle"></i>
                <span>100% Free Hosting</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                <i className="fas fa-check-circle"></i>
                <span>Private & Secure</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center">
              <p className="text-3xl font-black text-white mb-1">0ms</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency</p>
            </div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-center">
              <p className="text-3xl font-black text-white mb-1">$0</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Cost</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
