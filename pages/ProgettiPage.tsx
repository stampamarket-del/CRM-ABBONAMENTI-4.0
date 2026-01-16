import React, { useState, useMemo } from 'react';
import { Project, Task, Client, ProjectStatus, TaskStatus } from '../types';
import { PlusCircleIcon, CheckSquareIcon, ClockIcon, PencilIcon, Trash2Icon, XIcon, UsersIcon } from '../components/Icons';

interface ProgettiPageProps {
  projects: Project[];
  clients: Client[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const ProgettiPage: React.FC<ProgettiPageProps> = ({ 
  projects, clients, tasks, 
  onAddProject, onUpdateProject, onDeleteProject,
  onAddTask, onUpdateTask, onDeleteTask
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projectStatusLabels: Record<ProjectStatus, string> = {
    planning: 'In Pianificazione',
    active: 'Attivo',
    completed: 'Completato',
    on_hold: 'In Pausa'
  };

  const projectStatusColors: Record<ProjectStatus, string> = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    on_hold: 'bg-orange-100 text-orange-700'
  };

  const getProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const doneTasks = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((doneTasks / projectTasks.length) * 100);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedProjectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Dashboard Operativa</h2>
          <p className="text-slate-900 font-bold text-3xl">Gestione Progetti</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Nuovo Progetto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Progetti Recenti</h3>
          {projects.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold text-sm">Nessun progetto attivo.</p>
            </div>
          ) : (
            projects.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const progress = getProgress(project.id);
              const isActive = selectedProjectId === project.id;
              
              return (
                <div 
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'bg-white border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : projectStatusColors[project.status]
                    }`}>
                      {projectStatusLabels[project.status]}
                    </span>
                    <div className="flex items-center gap-1 opacity-50">
                        <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} className="p-1 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 hover:text-red-400"><Trash2Icon className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h4 className="font-black text-lg leading-tight mb-1">{project.name}</h4>
                  <p className={`text-xs font-bold mb-4 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                    {client ? `${client.name} ${client.surname}` : 'Cliente non assegnato'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-white' : 'bg-blue-600'}`} 
                          style={{ width: `${progress}%` }} 
                        />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Project Details & Tasks */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 sm:p-12 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div className="space-y-2">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Dettaglio Progetto</span>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedProject.name}</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">{selectedProject.description || 'Nessuna descrizione fornita.'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase">
                                <ClockIcon className="w-4 h-4" />
                                <span>Inizio: {new Date(selectedProject.startDate).toLocaleDateString()}</span>
                            </div>
                            {selectedProject.endDate && (
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Scadenza: {new Date(selectedProject.endDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Tasks List</h3>
                        <button 
                          onClick={() => {
                            const title = prompt('Titolo del Task?');
                            if (title) onAddTask({ 
                                projectId: selectedProject.id, 
                                title, 
                                status: 'todo' 
                            });
                          }}
                          className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            <PlusCircleIcon className="w-4 h-4" />
                            Aggiungi Attività
                        </button>
                    </div>

                    <div className="space-y-3">
                        {selectedProjectTasks.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">Non ci sono task definiti per questo progetto.</p>
                            </div>
                        ) : (
                            selectedProjectTasks.sort((a,b) => a.status === 'done' ? 1 : -1).map(task => (
                                <div key={task.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                                    <button 
                                      onClick={() => onUpdateTask({ 
                                        ...task, 
                                        status: task.status === 'done' ? 'todo' : 'done' 
                                      })}
                                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        task.status === 'done' 
                                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                                          : 'border-slate-200 text-transparent hover:border-blue-400'
                                      }`}
                                    >
                                        <CheckSquareIcon className="w-4 h-4" />
                                    </button>
                                    <div className="flex-1">
                                        <h5 className={`font-bold text-sm ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                                          {task.title}
                                        </h5>
                                        {task.dueDate && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scade: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => {
                                            const newTitle = prompt('Nuovo titolo?', task.title);
                                            if (newTitle) onUpdateTask({ ...task, title: newTitle });
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => onDeleteTask(task.id)}
                                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-100 text-center space-y-6">
                <div className="bg-slate-50 text-slate-300 p-8 rounded-full border border-slate-100">
                    <CheckSquareIcon className="w-16 h-16" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dettaglio Progetto</h3>
                  <p className="text-slate-400 font-medium max-w-sm mt-2">Seleziona un progetto dalla lista a sinistra per visualizzare i dettagli e gestire i task operativi.</p>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {(isAddModalOpen || editingProject) && (
        <ProjectForm 
          project={editingProject || undefined}
          clients={clients}
          onSave={(p) => {
            if (editingProject) onUpdateProject({ ...editingProject, ...p });
            else onAddProject(p as Omit<Project, 'id'>);
            setIsAddModalOpen(false);
            setEditingProject(null);
          }}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

interface ProjectFormProps {
    project?: Project;
    clients: Client[];
    onSave: (p: Partial<Project>) => void;
    onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, clients, onSave, onClose }) => {
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [clientId, setClientId] = useState(project?.clientId || '');
    const [status, setStatus] = useState<ProjectStatus>(project?.status || 'planning');
    const [startDate, setStartDate] = useState(project?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{project ? 'Modifica Progetto' : 'Nuovo Progetto'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><XIcon className="w-6 h-6" /></button>
                </div>
                <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ name, description, clientId, status, startDate }); }}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome Progetto *" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required />
                        <textarea placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium h-32" />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required>
                                <option value="">Cliente *</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.surname}</option>)}
                            </select>
                            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
                                <option value="planning">Pianificazione</option>
                                <option value="active">Attivo</option>
                                <option value="on_hold">In Pausa</option>
                                <option value="completed">Completato</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Data Inizio</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Annulla</button>
                        <button type="submit" className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">Salva Progetto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgettiPage;