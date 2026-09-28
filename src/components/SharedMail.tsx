import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { EmailMessage } from '../types';
import { MAIL_TAXONOMY } from '../types/mail-taxonomy';

interface SharedMailProps {
  emails: EmailMessage[];
  onSelectEmail: (email: EmailMessage) => void;
}

export const SharedMail: React.FC<SharedMailProps> = ({ emails, onSelectEmail }) => {
  const unreadCount = emails.filter((e) => !e.isRead).length;
  const urgentCount = emails.filter((e) => e.priority === 'p0').length;
  const pendingValidationCount = emails.filter((e) => e.replyStatus === 'pending').length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Courrier & Boîte Partagée FFMC 06
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              coordinateur.ffmc06@gmail.com · Brouillons IA à valider
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-mono font-bold border border-red-200 dark:border-red-900/50 text-[11px]">
            {urgentCount} P0
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-mono font-bold border border-amber-200 dark:border-amber-900/50 text-[11px]">
            {pendingValidationCount} en attente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {Object.values(MAIL_TAXONOMY).slice(0, 4).map((tax) => {
          const count = emails.filter((e) => e.category === tax.id).length;
          return (
            <div
              key={tax.id}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
            >
              <span className="text-slate-600 dark:text-zinc-400 truncate text-[11px] font-medium">
                {tax.label}
              </span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 ml-1 font-mono">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
