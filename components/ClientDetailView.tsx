
import React, { useState } from 'react';
import { Client, ProjectStatus, ClientStatus, CreativeMockup, Project, Task } from '../types';
import { analyzeLead, draftEmail, generateMockup } from '../services/geminiService';
import { DEFAULT_SERVICE_COSTS } from '../constants';

interface ClientDetailViewProps {
  client: Client;
  onBack: () => void;
  onUpdate: (client: Client) => void;
  onDelete: () => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ client, onBack, onUpdate, onDelete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    type: 'Website' as Project['type'],
    startDate: new Date().toISOString().split('T')[0],
    estimatedCost: DEFAULT_SERVICE_COSTS['Website']
  });

  const [mockupPrompt, setMockupPrompt] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLead(client.name, client.notes);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleDraftEmail = async (context: string) => {
    setIsDrafting(true);
    const fullContext = `Context: ${context}. Notes: ${client.notes}`;
    const draft = await draftEmail(client.name, fullContext);
    setEmailDraft(draft);
    setIsDrafting(false);
  };

  const handleStatusChange = (newStatus: ClientStatus) => {
    onUpdate({ ...client, status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${client.name}? All project data and AI mockups will be lost.`)) {
      onDelete();
    }
  };

  const handleGenerateMockup = async () => {
    if (!mockupPrompt) return;
    setIsGeneratingImg(true);
    const imgUrl = await generateMockup(mockupPrompt);
    if (imgUrl) {
      const newMockup: CreativeMockup = {
        id: Date.now().toString(),
        url: imgUrl,
        prompt: mockupPrompt,
        createdAt: new Date().toISOString()
      };
      const updatedMockups = [...(client.mockups || []), newMockup];
      onUpdate({ ...client, mockups: updatedMockups });
      setMockupPrompt('');
    } else {
      alert("Failed to generate image. Please try a different prompt.");
    }
    setIsGeneratingImg(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: newProjectData.name,
      type: newProjectData.type,
      status: ProjectStatus.PLANNING,
      progress: 0,
      startDate: newProjectData.startDate,
      estimatedCost: newProjectData.estimatedCost,
      tasks: []
    };

    const updatedProjects = [...client.projects, newProject];
    onUpdate({ ...client, projects: updatedProjects });
    setIsAddProjectModalOpen(false);
    setNewProjectData({
      name: '',
      type: 'Website',
      startDate: new Date().toISOString().split('T')[0],
      estimatedCost: DEFAULT_SERVICE_COSTS['Website']
    });
  };

  const handleLinkResource = (projectId: string, type: 'drive' | 'sheet') => {
    const url = window.prompt(`Paste the Google ${type === 'drive' ? 'Drive Folder' : 'Sheets'} URL:`);
    if (url && url.trim() !== "") {
      const updatedProjects = client.projects.map(p => {
        if (p.id === projectId) {
          return type === 'drive' ? { ...p, driveLink: url } : { ...p, sheetLink: url };
        }
        return p;
      });
      onUpdate({ ...client, projects: updatedProjects });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Draft copied to clipboard!");
  };

  const ensureProtocol = (url: string) => {
    if (!url || url.trim() === '') return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const handleUpdateProjectNotes = (projectId: string, notes: string) => {
    const updatedProjects = client.projects.map(p =>
      p.id === projectId ? { ...p, notes } : p
    );
    onUpdate({ ...client, projects: updatedProjects });
  };

  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    const updatedProjects = client.projects.map(p =>
      p.id === projectId ? { ...p, status } : p
    );
    onUpdate({ ...client, projects: updatedProjects });
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleAddTask = (projectId: string, title: string) => {
    if (!title.trim()) return;
    const updatedProjects = client.projects.map(p => {
      if (p.id === projectId) {
        const newTasks = [...p.tasks, { id: Date.now().toString(), title, completed: false }];
        return { ...p, tasks: newTasks, progress: calculateProgress(newTasks) };
      }
      return p;
    });
    onUpdate({ ...client, projects: updatedProjects });
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    const updatedProjects = client.projects.map(p => {
      if (p.id === projectId) {
        const newTasks = p.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        return { ...p, tasks: newTasks, progress: calculateProgress(newTasks) };
      }
      return p;
    });
    onUpdate({ ...client, projects: updatedProjects });
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    const updatedProjects = client.projects.map(p => {
      if (p.id === projectId) {
        const newTasks = p.tasks.filter(t => t.id !== taskId);
        return { ...p, tasks: newTasks, progress: calculateProgress(newTasks) };
      }
      return p;
    });
    onUpdate({ ...client, projects: updatedProjects });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium mb-4"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-4 border border-indigo-100 shadow-sm">
                {client.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
              <p className="text-slate-500 font-medium">{client.company}</p>

              <div className="mt-4 w-full">
                <select
                  value={client.status}
                  onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
                  className={`w-full text-center appearance-none px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${client.status === ClientStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    client.status === ClientStatus.LEAD ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      client.status === ClientStatus.POTENTIAL ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                >
                  <option value={ClientStatus.LEAD}>Fresh Start</option>
                  <option value={ClientStatus.ACTIVE}>In Motion</option>
                  <option value={ClientStatus.POTENTIAL}>On Deck</option>
                  <option value={ClientStatus.CHURNED}>Concluded</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center space-x-3 text-slate-600">
                <i className="far fa-envelope w-5 text-indigo-400"></i>
                <span className="text-sm font-semibold">{client.email || 'No Email Added'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <i className="fas fa-phone w-5 text-indigo-400"></i>
                <span className="text-sm font-semibold">{client.phone || 'No Phone Added'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Revenue Projection</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight">${client.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Total Engagements</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{client.projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fas fa-bolt text-4xl"></i>
            </div>
            <h3 className="font-bold flex items-center mb-4 text-sm uppercase tracking-widest text-indigo-400">
              <i className="fas fa-sparkles mr-2"></i>
              Re:CNXT AI
            </h3>

            <div className="space-y-3 relative z-10">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-white/10 hover:bg-white/20 disabled:bg-slate-800 py-3 rounded-xl text-xs font-black transition-all border border-white/10 flex items-center justify-center uppercase tracking-widest"
              >
                {isAnalyzing ? <i className="fas fa-spinner animate-spin mr-2"></i> : <i className="fas fa-brain mr-2"></i>}
                Analyze Lead
              </button>
              <button
                onClick={() => handleDraftEmail("Professional follow-up proposal with creative overview.")}
                disabled={isDrafting}
                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-black transition-all border border-white/10 flex items-center justify-center uppercase tracking-widest"
              >
                {isDrafting ? <i className="fas fa-spinner animate-spin mr-2"></i> : <i className="far fa-paper-plane mr-2"></i>}
                Draft Proposal
              </button>
            </div>
          </div>

        </div>

        <div className="lg:col-span-2 space-y-6">
          {aiAnalysis && (
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative animate-in fade-in duration-500 shadow-xl shadow-indigo-500/20">
              <button onClick={() => setAiAnalysis(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl border border-white/20">
                  <i className="fas fa-magic"></i>
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm">Intelligence Report</h4>
                  <p className="text-xs text-indigo-200">Powered by Gemini Pro Intelligence</p>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-lg font-medium leading-relaxed italic opacity-90">"{aiAnalysis.summary}"</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-black text-indigo-300 tracking-widest mb-1">Lead Quality</p>
                    <p className="text-2xl font-black">{aiAnalysis.leadQuality}/10</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-black text-indigo-300 tracking-widest mb-1">Expansion Potential</p>
                    <p className="text-xs font-bold leading-tight mt-1">{aiAnalysis.nextAction}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center">
                <i className="fas fa-palette mr-3 text-pink-500"></i>
                AI Creative Studio
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flash 2.5 Image Engine</span>
            </div>

            <div className="flex gap-4 mb-8">
              <input
                type="text"
                placeholder="Describe a website mockup..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-950 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                value={mockupPrompt}
                onChange={(e) => setMockupPrompt(e.target.value)}
              />
              <button
                onClick={handleGenerateMockup}
                disabled={isGeneratingImg || !mockupPrompt}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {isGeneratingImg ? <i className="fas fa-spinner animate-spin"></i> : 'Generate'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {client.mockups?.map((mockup) => (
                <div key={mockup.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm hover:shadow-md transition-all">
                  <img src={mockup.url} alt={mockup.prompt} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] text-white font-bold leading-tight mb-3 line-clamp-3">{mockup.prompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = mockup.url;
                          link.download = `mockup-${mockup.id}.png`;
                          link.click();
                        }}
                        className="bg-white text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!client.mockups || client.mockups.length === 0) && (
                <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-image text-3xl mb-3 opacity-20"></i>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40">No concepts generated yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center px-8">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Active Engagements</h3>
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
              >
                + New Project
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {client.projects.map(project => (
                <div key={project.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg tracking-tight">{project.name}</h4>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.type}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Started {new Date(project.startDate).toLocaleDateString()}</span>
                        {project.estimatedCost && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Est. ${project.estimatedCost.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <select
                      value={project.status}
                      onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value as ProjectStatus)}
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 outline-none cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      {Object.values(ProjectStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Completion Rate</span>
                        <span className="text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <div className="bg-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => project.driveLink ? window.open(ensureProtocol(project.driveLink), '_blank') : handleLinkResource(project.id, 'drive')}
                        className={`flex-1 flex items-center justify-center py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border ${project.driveLink
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        <i className={`fab fa-google-drive mr-2 text-xs ${project.driveLink ? 'text-blue-500' : 'text-slate-300'}`}></i>
                        {project.driveLink ? 'View Assets' : '+ Link Assets'}
                      </button>
                      <button
                        onClick={() => project.sheetLink ? window.open(ensureProtocol(project.sheetLink), '_blank') : handleLinkResource(project.id, 'sheet')}
                        className={`flex-1 flex items-center justify-center py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border ${project.sheetLink
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        <i className={`far fa-file-excel mr-2 text-xs ${project.sheetLink ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                        {project.sheetLink ? 'Open Tracker' : '+ Link Tracker'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks & Milestones</h5>
                      <span className="text-[10px] font-bold text-slate-400">{project.tasks.filter(t => t.completed).length} / {project.tasks.length} Done</span>
                    </div>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {project.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between group/task bg-slate-50/50 p-3 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(project.id, task.id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className={`text-sm font-semibold transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {task.title}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(project.id, task.id)}
                            className="opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                          >
                            <i className="fas fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      ))}
                      {project.tasks.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-2">No tasks added yet. Breakdown the scope below!</p>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add a new task..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 pr-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTask(project.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <i className="fas fa-plus text-[10px] text-slate-300"></i>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Scope & Requirements</h5>
                      <button
                        onClick={() => handleUpdateProjectNotes(project.id, `Requirement Analysis for ${client.name} - ${project.name}:\n\n- Primary Objective: \n- Key Deliverables: \n- Deadline Priority: \n- Technical Specs: `)}
                        className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                      >
                        Auto-Generate Template
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 min-h-[120px] placeholder:italic"
                      placeholder="Document project progress, customer requests, or specific technical requirements here..."
                      value={project.notes || ''}
                      onChange={(e) => handleUpdateProjectNotes(project.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {client.projects.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-widest">No projects currently assigned</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-rose-50/50 border border-rose-100/50 p-6 rounded-[1.5rem] mt-12 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-triangle-exclamation text-rose-400 text-xs"></i>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Delete Profile</p>
            </div>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </div>

      {emailDraft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setEmailDraft(null)}></div>
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">AI Generated Proposal</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Ready for review & deployment</p>
              </div>
              <button onClick={() => setEmailDraft(null)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-10 overflow-y-auto text-slate-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-indigo-500 selection:text-white scrollbar-thin scrollbar-thumb-slate-700">
              {emailDraft}
            </div>
            <div className="p-8 bg-slate-800/50 border-t border-white/5 flex gap-4">
              <button
                onClick={() => copyToClipboard(emailDraft)}
                className="flex-1 bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <i className="far fa-copy mr-2"></i>
                Copy To Clipboard
              </button>
              <button
                onClick={() => setEmailDraft(null)}
                className="px-8 bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAddProjectModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Initiate New Engagement</h3>
              <button onClick={() => setIsAddProjectModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Name</label>
                <input
                  required
                  placeholder="e.g. Q4 Growth Campaign"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-950 outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
                  value={newProjectData.name}
                  onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Stream</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-950 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={newProjectData.type}
                  onChange={e => {
                    const newType = e.target.value as Project['type'];
                    setNewProjectData({
                      ...newProjectData,
                      type: newType,
                      estimatedCost: DEFAULT_SERVICE_COSTS[newType]
                    });
                  }}
                >
                  <option value="Website">Website Building</option>
                  <option value="Marketing">Digital Marketing</option>
                  <option value="SEO">SEO Strategy</option>
                  <option value="PPC">PPC Management</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-950 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={newProjectData.estimatedCost}
                  onChange={e => setNewProjectData({ ...newProjectData, estimatedCost: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deployment Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-950 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={newProjectData.startDate}
                  onChange={e => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                />
              </div>

              <div className="pt-6">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Initialization Status</p>
                  <p className="text-xs font-bold text-indigo-700">Project will start in 'Planning' phase at 0% progress.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
                >
                  Confirm Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailView;
