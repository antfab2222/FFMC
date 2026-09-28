import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  Link as LinkIcon,
  ChevronDown,
  Eye,
  Check,
  AlertCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskSourceType } from '../types';

interface TasksTableProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onViewSource: (task: Task) => void;
}

export const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  todo: {
    label: 'À faire',
    color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    icon: Clock,
  },
  in_progress: {
    label: 'En cours',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: Clock,
  },
  waiting: {
    label: 'En attente',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: PauseCircle,
  },
  completed: {
    label: 'Terminé',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    icon: XCircle,
  },
};

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string; badge: string }> = {
  p0: {
    label: 'P0 - Urgent (24h)',
    color: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 font-bold',
  },
  p1: {
    label: 'P1 - Important',
    color: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-medium',
  },
  p2: {
    label: 'P2 - Normal',
    color: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  p3: {
    label: 'P3 - Basse',
    color: 'text-slate-500 dark:text-zinc-400',
    badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  },
};

const SOURCE_LABELS: Record<TaskSourceType, { label: string; icon: string }> = {
  email: { label: 'Courrier', icon: '✉️' },
  meeting: { label: 'Réunion CA', icon: '👥' },
  news: { label: 'Veille', icon: '📰' },
  manual: { label: 'Direct CA', icon: '✍️' },
};

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onUpdateStatus,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onViewSource,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('p1');
  const [newAssignee, setNewAssignee] = useState('Antoine (Coordinateur)');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [newTags, setNewTags] = useState('FFMC 06, Terrain');

  const assigneesList = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.sourceTitle && task.sourceTitle.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
        const matchesSource = sourceFilter === 'all' || task.sourceType === sourceFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesSource;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return sortOrder === 'asc'
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
        }
        if (sortBy === 'priority') {
          const rank: Record<TaskPriority, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
          return sortOrder === 'asc'
            ? rank[a.priority] - rank[b.priority]
            : rank[b.priority] - rank[a.priority];
        }
        return sortOrder === 'asc'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sourceFilter, sortBy, sortOrder]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: 'todo',
      priority: newPriority,
      assignee: newAssignee,
      dueDate: newDueDate,
      sourceType: 'manual',
      sourceTitle: 'Saisie directe CA FFMC 06',
      sourceSnippet: newDescription.trim(),
      tags: newTags.split(',').map((s) => s.trim()).filter(Boolean),
    });

    setNewTitle('');
    setNewDescription('');
    setIsNewTaskModalOpen(false);
  };

  const isOverdue = (dateStr: string, status: TaskStatus) => {
    if (status === 'completed' || status === 'cancelled') return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une action, mot-clé, route, adhérent..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-red-600 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Tous statuts ({tasks.length})</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="waiting">En attente</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Toutes priorités</option>
              <option value="p0">🔴 P0 - Urgences (24h)</option>
              <option value="p1">🟠 P1 - Important</option>
              <option value="p2">🔵 P2 - Normal</option>
              <option value="p3">⚪ P3 - Basse</option>
            </select>

            {/* Assignee filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Tous référents</option>
              {assigneesList.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* Source filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-slate-400"
            >
              <option value="all">Toutes sources</option>
              <option value="email">✉️ Courrier</option>
              <option value="meeting">👥 Réunion</option>
              <option value="news">📰 Veille</option>
              <option value="manual">✍️ Direct CA</option>
            </select>

            {/* New Task button */}
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-28 text-center">Statut</th>
                <th className="py-3 px-4">Action & Objet</th>
                <th className="py-3 px-3 w-36">
                  <button
                    onClick={() => {
                      if (sortBy === 'priority') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('priority');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    Priorité <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 w-48">Référent</th>
                <th className="py-3 px-3 w-36">
                  <button
                    onClick={() => {
                      if (sortBy === 'dueDate') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('dueDate');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    Échéance <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 w-44">Source & Traçabilité</th>
                <th className="py-3 px-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs sm:text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-zinc-300">Aucun dossier ne correspond aux critères.</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Modifiez vos filtres ou créez une nouvelle action.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const statusInfo = STATUS_LABELS[task.status];
                  const priorityInfo = PRIORITY_LABELS[task.priority];
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        task.status === 'completed' ? 'opacity-60 bg-slate-50/40 dark:bg-zinc-950/40' : ''
                      }`}
                    >
                      {/* Status toggle column */}
                      <td className="py-3 px-4 text-center align-top">
                        <div className="relative inline-block text-left">
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                            className={`text-[11px] font-semibold rounded-md px-2 py-1 border transition appearance-none cursor-pointer pr-5 ${statusInfo.color}`}
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="waiting">En attente</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 pointer-events-none opacity-50 text-slate-500" />
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-slate-900 dark:text-zinc-100 ${
                                task.status === 'completed' ? 'line-through text-slate-400 dark:text-zinc-500' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {task.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${priorityInfo.badge}`}>
                          {priorityInfo.label}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3 align-top text-xs text-slate-700 dark:text-zinc-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                            {task.assignee.charAt(0)}
                          </div>
                          <span className="truncate max-w-[140px]">{task.assignee}</span>
                        </div>
                      </td>

                      {/* Due date */}
                      <td className="py-3 px-3 align-top text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 ${overdue ? 'text-red-600' : 'text-slate-400'}`} />
                          <span
                            className={`font-mono font-medium ${
                              overdue ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            {task.dueDate}
                          </span>
                        </div>
                        {overdue && (
                          <span className="block text-[10px] text-red-600 dark:text-red-400 font-semibold mt-0.5">
                            Échéance dépassée
                          </span>
                        )}
                      </td>

                      {/* Source & Traceability */}
                      <td className="py-3 px-3 align-top">
                        <button
                          onClick={() => onViewSource(task)}
                          className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition w-full text-left"
                          title="Consulter la pièce source et l'extrait d'origine"
                        >
                          <span>{SOURCE_LABELS[task.sourceType]?.icon || '📄'}</span>
                          <span className="truncate flex-1 font-medium">
                            {task.sourceTitle || SOURCE_LABELS[task.sourceType]?.label || 'Détails'}
                          </span>
                          <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-center">
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                          title="Supprimer la tâche"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>
            Affichage de <strong>{filteredTasks.length}</strong> action(s) sur un total de <strong>{tasks.length}</strong>
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              {tasks.filter((t) => t.priority === 'p0' && t.status !== 'completed').length} urgences P0 actives
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              {tasks.filter((t) => t.status === 'completed').length} terminées
            </span>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-700 dark:text-red-400" />
                Créer une nouvelle action FFMC 06
              </h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Intitulé du dossier / action *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Contacter Mairie de Nice sur couloir bus Gambetta"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Description & consignes
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Détails, personnes à contacter, arguments ou contexte opérationnel..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="p0">🔴 P0 - Urgence vitale / 24h</option>
                    <option value="p1">🟠 P1 - Important</option>
                    <option value="p2">🔵 P2 - Normal</option>
                    <option value="p3">⚪ P3 - Basse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Échéance</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Référent désigné</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Antoine (Coordinateur)">Antoine (Coordinateur)</option>
                    <option value="Bureau FFMC 06">Bureau FFMC 06</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Tags (virgules)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Voirie, Nice, ZFE..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs shadow-xs"
                >
                  Enregistrer l'action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
