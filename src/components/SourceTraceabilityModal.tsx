import React from 'react';
import { X, ExternalLink, Mail, Calendar, Newspaper, PenTool, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Task, EmailMessage, Meeting, NewsItem } from '../types';

interface SourceTraceabilityModalProps {
  task: Task | null;
  onClose: () => void;
  emails: EmailMessage[];
  meetings: Meeting[];
  newsList: NewsItem[];
  onNavigateToSource?: (type: string, id: string) => void;
}

export const SourceTraceabilityModal: React.FC<SourceTraceabilityModalProps> = ({
  task,
  onClose,
  emails,
  meetings,
  newsList,
  onNavigateToSource,
}) => {
  if (!task) return null;

  // Find linked object
  const linkedEmail = task.sourceType === 'email' ? emails.find((e) => e.id === task.sourceId) : undefined;
  const linkedMeeting = task.sourceType === 'meeting' ? meetings.find((m) => m.id === task.sourceId) : undefined;
  const linkedNews = task.sourceType === 'news' ? newsList.find((n) => n.id === task.sourceId) : undefined;

  const renderSourceContent = () => {
    if (task.sourceType === 'email') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Expéditeur :</span>
              <span className="text-slate-600 dark:text-zinc-400">
                {linkedEmail ? `${linkedEmail.senderName} (${linkedEmail.senderEmail})` : 'Expéditeur email'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Date de réception :</span>
              <span className="text-slate-600 dark:text-zinc-400">
                {linkedEmail ? new Date(linkedEmail.receivedAt).toLocaleString('fr-FR') : 'Date inconnue'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Catégorie IA :</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-[11px]">
                {linkedEmail?.category || 'Classifié par IA'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Extrait textuel à l'origine de la tâche :
            </h4>
            <blockquote className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border-l-4 border-red-600 text-sm text-slate-800 dark:text-zinc-200 italic font-serif leading-relaxed">
              "{task.sourceSnippet || linkedEmail?.snippet || 'Pas d’extrait enregistré.'}"
            </blockquote>
          </div>

          {linkedEmail && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Corps complet de l'email :
              </h4>
              <div className="max-h-48 overflow-y-auto p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-line font-mono leading-relaxed">
                {linkedEmail.body}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (task.sourceType === 'meeting') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Réunion :</span>
              <span className="text-slate-600 dark:text-zinc-400">{linkedMeeting?.title || task.sourceTitle}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Lieu & Date :</span>
              <span className="text-slate-600 dark:text-zinc-400">
                {linkedMeeting ? `${linkedMeeting.location} • ${new Date(linkedMeeting.date).toLocaleDateString('fr-FR')}` : 'Maison des Associations, Nice'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Participants :</span>
              <span className="text-slate-600 dark:text-zinc-400">{linkedMeeting?.attendees.join(', ')}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Décision de réunion :
            </h4>
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600 text-sm text-slate-800 dark:text-zinc-200">
              {task.sourceSnippet || linkedMeeting?.summary}
            </div>
          </div>
        </div>
      );
    }

    if (task.sourceType === 'news') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Source officielle :</span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">{linkedNews?.source || 'Source réglementaire'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Date de parution :</span>
              <span className="text-slate-600 dark:text-zinc-400">{linkedNews ? new Date(linkedNews.publishedAt).toLocaleDateString('fr-FR') : 'Récent'}</span>
            </div>
            {linkedNews?.sourceUrl && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Lien direct :</span>
                <a
                  href={linkedNews.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Ouvrir l’arrêté / source <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Contexte de veille :
            </h4>
            <p className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-600 text-sm text-slate-800 dark:text-zinc-200">
              {task.sourceSnippet || linkedNews?.summary}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-sm text-slate-700 dark:text-zinc-300">
        <p>Cette tâche a été créée manuellement par un membre du bureau FFMC 06.</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 font-mono">Date de création : {new Date(task.createdAt).toLocaleString('fr-FR')}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Traçabilité de la Tâche
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Garantie d'origine et contexte documentaire source
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="truncate pr-4">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 mr-2">#{task.id}</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{task.title}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded font-mono uppercase font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xs">
            {task.assignee}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {renderSourceContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Dernière mise à jour : {new Date(task.updatedAt).toLocaleDateString('fr-FR')}
          </span>
          <div className="flex gap-2">
            {onNavigateToSource && task.sourceId && (
              <button
                onClick={() => {
                  onNavigateToSource(task.sourceType, task.sourceId!);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition"
              >
                <span>Voir dans le module</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-2xs"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
