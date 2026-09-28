import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Mail,
  Newspaper,
  Calendar,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Task, EmailMessage, NewsItem, Meeting, TaskStatus } from './types';
import { TasksTable } from './components/TasksTable';
import { SourceTraceabilityModal } from './components/SourceTraceabilityModal';
import { MotoNews } from './components/MotoNews';
import { SharedMail } from './components/SharedMail';

interface DashboardProps {
  tasks: Task[];
  emails: EmailMessage[];
  newsList: NewsItem[];
  meetings: Meeting[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigateTab: (tab: string) => void;
  onOpenEmail: (email: EmailMessage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  emails,
  newsList,
  meetings,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onNavigateTab,
  onOpenEmail,
}) => {
  const [selectedTaskForTraceability, setSelectedTaskForTraceability] = useState<Task | null>(null);

  const totalTasks = tasks.length;
  const urgentP0Tasks = tasks.filter((t) => t.priority === 'p0' && t.status !== 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const waitingTasks = tasks.filter((t) => t.status === 'waiting');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Urgent P0 */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-semibold">Urgences P0 (24h)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-400">{urgentP0Tasks.length}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">actives</span>
          </div>
          <div className="mt-2 text-[11px] text-red-700/80 dark:text-red-300 font-medium">
            {urgentP0Tasks.length > 0 ? 'Danger voirie ou réponse urgente' : 'Aucune urgence critique'}
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-semibold">Dossiers en cours</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">{inProgressTasks.length}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">dossiers</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            {waitingTasks.length} action(s) en attente de réponse
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-semibold">Actions résolues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">{completedTasks.length}</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">/ {totalTasks}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700/90 dark:text-emerald-400 font-medium">
            Taux de résolution : {completionRate}%
          </div>
        </div>

        {/* Source Distribution */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-semibold">Origines & Traçabilité</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-amber-700 dark:text-amber-400 font-bold">{tasks.filter((t) => t.sourceType === 'email').length}</span>
              <span className="text-slate-400 dark:text-zinc-500 ml-1">Courrier</span>
            </div>
            <div>
              <span className="text-indigo-700 dark:text-indigo-400 font-bold">{tasks.filter((t) => t.sourceType === 'meeting').length}</span>
              <span className="text-slate-400 dark:text-zinc-500 ml-1">Réunion</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400 font-bold">{tasks.filter((t) => t.sourceType === 'news').length}</span>
              <span className="text-slate-400 dark:text-zinc-500 ml-1">Veille</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            100% rattachées à une preuve source
          </div>
        </div>
      </div>

      {/* Main Core Section: Tasks Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-700 dark:text-red-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Tableau Opérationnel des Dossiers & Actions (CA FFMC 06)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Gestion partagée • Synchronisation RLS
          </span>
        </div>

        <TasksTable
          tasks={tasks}
          onUpdateStatus={onUpdateTaskStatus}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddTask={onAddTask}
          onViewSource={(task) => setSelectedTaskForTraceability(task)}
        />
      </div>

      {/* Auxiliary Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <SharedMail
          emails={emails}
          onSelectEmail={(email) => {
            onNavigateTab('inbox');
            onOpenEmail(email);
          }}
        />

        <MotoNews
          newsList={newsList}
          onNavigateToNews={() => onNavigateTab('news')}
        />
      </div>

      {/* Traceability Modal */}
      {selectedTaskForTraceability && (
        <SourceTraceabilityModal
          task={selectedTaskForTraceability}
          onClose={() => setSelectedTaskForTraceability(null)}
          emails={emails}
          meetings={meetings}
          newsList={newsList}
          onNavigateToSource={(type, id) => {
            if (type === 'email') onNavigateTab('inbox');
            if (type === 'meeting') onNavigateTab('meetings');
            if (type === 'news') onNavigateTab('news');
          }}
        />
      )}
    </div>
  );
};
