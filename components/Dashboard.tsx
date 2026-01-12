
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Client, ProjectStatus, ClientStatus, WorkspaceConfig } from '../types';

interface DashboardProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, onSelectClient }) => {
  const workspaceConfig: WorkspaceConfig = JSON.parse(localStorage.getItem('recnxt_workspace_config') || '{}');
  const activeProjects = clients.reduce((acc, client) => 
    acc + client.projects.filter(p => p.status !== ProjectStatus.COMPLETED).length, 0);
  
  const totalRevenue = clients.reduce((acc, c) => acc + c.totalRevenue, 0);
  
  const revenueData = [
    { name: 'Jan', revenue: 4200 },
    { name: 'Feb', revenue: 5800 },
    { name: 'Mar', revenue: totalRevenue },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Overview</h2>
          <p className="text-slate-500 font-medium">Tracking performance across {clients.length} agency clients</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 flex items-center">
            <span className={`w-2 h-2 ${workspaceConfig.isConnected ? 'bg-emerald-500' : 'bg-slate-300'} rounded-full ${workspaceConfig.isConnected ? 'animate-pulse' : ''} mr-2`}></span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {workspaceConfig.isConnected ? 'Cloud Sync Active' : 'Local Mode'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon="fa-users" label="Active Clients" value={clients.filter(c => c.status === ClientStatus.ACTIVE).length} color="indigo" />
        <MetricCard icon="fa-rocket" label="Open Projects" value={activeProjects} color="violet" />
        <MetricCard icon="fa-hand-holding-dollar" label="LTV Revenue" value={`$${totalRevenue.toLocaleString()}`} color="emerald" />
        <MetricCard icon="fa-bolt" label="Conversion" value="14.2%" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg">Growth Trajectory</h3>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg focus:ring-0 cursor-pointer">
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
             <i className="fas fa-crown text-9xl"></i>
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">Agency Health</h3>
            <p className="text-slate-400 text-sm mb-6">Your agency score is higher than 84% of similar users.</p>
            
            <div className="space-y-6">
              <HealthBar label="Lead Response Time" percent={92} color="bg-indigo-500" />
              <HealthBar label="Project Completion" percent={78} color="bg-emerald-500" />
              <HealthBar label="Client Retention" percent={85} color="bg-violet-500" />
            </div>
          </div>
          
          <button className="relative z-10 mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all border border-white/10 uppercase tracking-widest text-[10px]">
            View Performance Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center px-8">
          <h3 className="font-bold text-slate-800">Recent Lead Inquiries</h3>
          <button className="text-indigo-600 text-sm font-bold hover:underline">View All Pipeline</button>
        </div>
        <div className="divide-y divide-slate-50 px-4 pb-4">
          {clients.filter(c => c.status === ClientStatus.LEAD).map(lead => (
            <div 
              key={lead.id} 
              className="p-5 flex items-center justify-between hover:bg-slate-50 rounded-2xl cursor-pointer transition-all duration-200"
              onClick={() => onSelectClient(lead)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{lead.name}</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lead.company}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200/50">
                  {lead.status}
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(lead.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: string, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between h-40 group hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const HealthBar: React.FC<{ label: string, percent: number, color: string }> = ({ label, percent, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{width: `${percent}%`}}></div>
    </div>
  </div>
);

export default Dashboard;
