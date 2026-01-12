
import React, { useState, useEffect } from 'react';
import { AgencyProfile } from '../types';
import { StorageService } from '../services/storageService';
import WorkspaceSettings from './WorkspaceSettings';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'cloud'>('profile');

  useEffect(() => {
    setProfile(StorageService.getProfile());
  }, []);

  const handleSave = () => {
    if (profile) {
      setIsSaving(true);
      StorageService.saveProfile(profile);
      setTimeout(() => {
        setIsSaving(false);
        alert("Profile updated successfully!");
      }, 500);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Control Center</h2>
          <p className="text-slate-500 font-medium">Configure your agency identity and cloud infrastructure.</p>
        </div>
        
        <div className="flex p-1 bg-slate-200/50 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveSubTab('profile')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Agency Profile
          </button>
          <button 
            onClick={() => setActiveSubTab('cloud')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'cloud' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Cloud Backend
          </button>
        </div>
      </header>

      {activeSubTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-8 flex items-center text-lg">
                <i className="fas fa-building mr-4 text-indigo-500"></i>
                Agency Identity
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Agency Brand Name</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-700"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Digital Headquarters (URL)</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-700"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                  >
                    {isSaving ? <i className="fas fa-spinner animate-spin mr-2"></i> : <i className="fas fa-check-circle mr-2 text-indigo-400"></i>}
                    Commit Profile Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-8 flex items-center text-lg">
                <i className="fas fa-shield-alt mr-4 text-emerald-500"></i>
                Data Integrity
              </h3>
              <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <i className="fas fa-database text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900">Encrypted Local Database</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Storage Status: Optimized</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i> Export Data
                </button>
                <button className="py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center">
                  <i className="fas fa-upload mr-2"></i> Purge & Reset
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 flex flex-col items-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <i className="fas fa-crown text-8xl"></i>
               </div>
               <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-white/20 backdrop-blur-md relative z-10">
                 <i className="fas fa-gem"></i>
               </div>
               <h4 className="font-black text-2xl mb-2 tracking-tight relative z-10">{profile.plan} Access</h4>
               <p className="text-indigo-100 text-xs mb-8 font-medium leading-relaxed relative z-10">You have full administrative privileges and unlimited AI tokens.</p>
               <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all relative z-10">
                 System Logs
               </button>
            </div>

            <div className="bg-slate-900 text-slate-400 p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="font-black text-white text-[10px] uppercase tracking-[0.2em] mb-6 px-1">System Health</h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Gemini Flash 2.5</span>
                  <span className="text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Grounding Engine</span>
                  <span className="text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>API Latency</span>
                  <span className="text-slate-300">142ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <WorkspaceSettings />
        </div>
      )}
    </div>
  );
};

export default Settings;
