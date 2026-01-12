
import React, { useState } from 'react';
import { searchProspects } from '../services/geminiService';
import { Client, ClientStatus } from '../types';

interface ProspectorProps {
  onAddLead: (client: Client) => void;
}

const Prospector: React.FC<ProspectorProps> = ({ onAddLead }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{text: string, sources: any[]} | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    // Get current location if available
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = await searchProspects(query, pos.coords.latitude, pos.coords.longitude);
        setResults(data);
        setIsSearching(false);
      },
      async () => {
        const data = await searchProspects(query);
        setResults(data);
        setIsSearching(false);
      }
    );
  };

  const handleImport = (name: string, info: string) => {
    const newLead: Client = {
      id: Date.now().toString(),
      name: name,
      company: name,
      email: '',
      phone: '',
      status: ClientStatus.LEAD,
      totalRevenue: 0,
      notes: info,
      projects: [],
      createdAt: new Date().toISOString()
    };
    onAddLead(newLead);
    alert(`${name} added to CRM as a Lead!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Prospector</h2>
          <p className="text-slate-500 font-medium">Find new business leads using Google Maps grounding.</p>
        </div>
        <div className="bg-indigo-600/5 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center">
          <i className="fas fa-location-dot text-indigo-600 mr-2 text-xs"></i>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Discovery Active</span>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="e.g. 'Coffee shops in Austin' or 'Real estate agents in Miami'"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center"
          >
            {isSearching ? <i className="fas fa-spinner animate-spin mr-2"></i> : <i className="fas fa-bolt mr-2 text-amber-400"></i>}
            Find Leads
          </button>
        </form>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                <i className="fas fa-list-ul mr-3 text-indigo-500"></i>
                Intelligence Report
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                {results.text}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-white/5">
                <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-400 mb-4">Location Sources</h4>
                <div className="space-y-3">
                  {results.sources.map((chunk: any, i: number) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                       <p className="text-xs font-bold truncate mb-1">{chunk.maps?.title || chunk.web?.title || 'Unknown Source'}</p>
                       <div className="flex justify-between items-center">
                         <a 
                          href={chunk.maps?.uri || chunk.web?.uri} 
                          target="_blank" 
                          className="text-[10px] text-indigo-300 font-bold hover:underline"
                         >
                           View on {chunk.maps ? 'Maps' : 'Web'}
                         </a>
                         <button 
                          onClick={() => handleImport(chunk.maps?.title || chunk.web?.title, `Found via AI Prospector search: ${query}`)}
                          className="text-[10px] bg-indigo-600 px-2 py-1 rounded-md font-black hover:bg-indigo-500 transition-all"
                         >
                           IMPORT
                         </button>
                       </div>
                    </div>
                  ))}
                  {results.sources.length === 0 && <p className="text-[10px] text-slate-500 italic">No direct links found.</p>}
                </div>
             </div>

             <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h4 className="font-bold text-amber-900 text-sm mb-2">Pro-Tip: Personalization</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Mention specific details from their Google Maps profile (like their reviews or service area) in your initial cold email to increase response rates by 40%.
                </p>
             </div>
          </div>
        </div>
      )}

      {!results && !isSearching && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50 grayscale">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6">
            <i className="fas fa-compass animate-spin-slow"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Ready to expand?</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Enter a business type and city above to find fresh leads for your agency.</p>
        </div>
      )}
    </div>
  );
};

export default Prospector;
