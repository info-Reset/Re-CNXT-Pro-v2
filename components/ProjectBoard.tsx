
import React from 'react';
import { Client, ProjectStatus, Project } from '../types';

interface ProjectBoardProps {
  clients: Client[];
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ clients }) => {
  const allProjects = clients.flatMap(c => 
    c.projects.map(p => ({ ...p, clientName: c.name, company: c.company }))
  );

  const columns: ProjectStatus[] = [
    ProjectStatus.PLANNING,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.REVIEW,
    ProjectStatus.COMPLETED
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Project Board</h2>
        <div className="flex gap-2">
          <div className="flex items-center text-xs text-slate-500 bg-white border px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Web
          </div>
          <div className="flex items-center text-xs text-slate-500 bg-white border px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Marketing
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(status => (
          <div key={status} className="flex flex-col h-full bg-slate-100/50 rounded-xl p-3 border border-slate-200 min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-slate-700 flex items-center">
                {status}
                <span className="ml-2 px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded-full font-bold">
                  {allProjects.filter(p => p.status === status).length}
                </span>
              </h3>
              <button className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-ellipsis-h text-xs"></i>
              </button>
            </div>

            <div className="space-y-3">
              {allProjects.filter(p => p.status === status).map(project => (
                <ProjectCard key={project.id} project={project as any} />
              ))}
              {allProjects.filter(p => p.status === status).length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-400">No projects here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project & { clientName: string, company: string } }> = ({ project }) => {
  const typeColors = {
    'Website': 'border-l-blue-500',
    'Marketing': 'border-l-green-500',
    'SEO': 'border-l-purple-500',
    'PPC': 'border-l-orange-500',
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 border-l-4 ${typeColors[project.type]} hover:shadow-md transition-all cursor-grab active:cursor-grabbing`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{project.type}</span>
        <div className="flex -space-x-2">
          <img src={`https://picsum.photos/seed/${project.id}/20/20`} className="w-5 h-5 rounded-full border border-white" />
        </div>
      </div>
      <h4 className="font-semibold text-slate-900 text-sm mb-1">{project.name}</h4>
      <p className="text-xs text-slate-500 mb-3">{project.company}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-slate-400 pt-3 border-t border-slate-50">
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="flex items-center">
            <i className="far fa-calendar mr-1"></i>
            {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center">
            <i className="fas fa-check-circle mr-1"></i>
            {project.tasks.filter(t => t.completed).length}/{project.tasks.length}
          </span>
        </div>
        {(project.driveLink || project.sheetLink) && (
          <i className="fab fa-google-drive text-blue-400"></i>
        )}
      </div>
    </div>
  );
};

export default ProjectBoard;
