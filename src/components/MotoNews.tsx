import React from 'react';
import { Flame, ArrowRight, ExternalLink } from 'lucide-react';
import { NewsItem } from '../types';

interface MotoNewsProps {
  newsList: NewsItem[];
  onSelectNews?: (item: NewsItem) => void;
  onNavigateToNews?: () => void;
}

export const MotoNews: React.FC<MotoNewsProps> = ({
  newsList,
  onSelectNews,
  onNavigateToNews,
}) => {
  const highImpact = newsList.filter((n) => n.impactLevel === 'fort');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Alertes Réglementaires & Infos Clés 06
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Légifrance, ZFE Nice Côte d'Azur, Sécurité Routière
            </p>
          </div>
        </div>
        {onNavigateToNews && (
          <button
            onClick={onNavigateToNews}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition"
          >
            <span>Voir toute la veille</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {highImpact.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectNews && onSelectNews(item)}
            className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 cursor-pointer transition space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
                {item.source}
              </span>
              <span className="text-slate-400 dark:text-zinc-500 font-mono text-[10px]">
                {new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 line-clamp-1">
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
