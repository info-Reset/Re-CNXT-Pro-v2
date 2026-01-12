
import React, { useState } from 'react';
import { Client, ClientStatus } from '../types';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClient: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onAddClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ClientStatus | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
    status: ClientStatus.LEAD
  });

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
      totalRevenue: 0,
      projects: [],
      createdAt: new Date().toISOString()
    };
    onAddClient(newClient);
    setIsAddModalOpen(false);
    setFormData({ name: '', company: '', email: '', phone: '', notes: '', status: ClientStatus.LEAD });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Client Directory</h2>
          <p className="text-slate-500 font-medium">Managing {clients.length} relationships across your agency</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
        >
          <i className="fas fa-plus mr-3"></i>
          Register Client
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search network..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-200">
          {['All', ClientStatus.ACTIVE, ClientStatus.LEAD, ClientStatus.POTENTIAL, ClientStatus.CHURNED].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-2.5 text-[10px] rounded-xl font-black uppercase tracking-widest transition-all ${
                filter === s 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Profile</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Activity</th>
                <th className="px-8 py-5">LTV</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => (
                <tr 
                  key={client.id} 
                  className="hover:bg-indigo-50/30 cursor-pointer group transition-all"
                  onClick={() => onSelectClient(client)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      client.status === ClientStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      client.status === ClientStatus.LEAD ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      client.status === ClientStatus.POTENTIAL ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-600">{client.projects.length} Campaigns</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {client.projects.filter(p => p.status === 'In Progress').length} Active
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900">${client.totalRevenue.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className="fas fa-chevron-right text-xs"></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <i className="fas fa-user-slash text-3xl"></i>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching profiles found</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register New Profile</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                    <i className="fas fa-times"></i>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-4 flex-1 custom-scrollbar">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Name</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Organization</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Line</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                   </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Status</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as ClientStatus})}
                    >
                       <option value={ClientStatus.LEAD}>Fresh Start</option>
                       <option value={ClientStatus.ACTIVE}>In Motion</option>
                       <option value={ClientStatus.POTENTIAL}>On Deck</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lead Intelligence Notes</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 h-32 placeholder:text-slate-300"
                      placeholder="Add initial thoughts, requirements, or discovery notes..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs mt-4"
                 >
                   Finalize Registration
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
