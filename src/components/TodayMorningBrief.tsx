import React, { useState, useEffect } from 'react';
import {
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  FileText,
  MailCheck,
  Check,
  ExternalLink,
  RefreshCw,
  Mountain,
  ChevronRight,
  Shield,
  Calendar,
  Layers,
  Wind,
  Thermometer,
} from 'lucide-react';
import { Task, EmailMessage, NewsItem, MorningBriefing, UserRole } from '../types';
import { INITIAL_MORNING_BRIEF } from '../data/mockData';
import { fetchLivePassesWeather, MountainPassLive } from '../services/weatherService';

interface TodayMorningBriefProps {
  tasks: Task[];
  emails: EmailMessage[];
  newsList: NewsItem[];
  userRole?: UserRole;
  onNavigateTab: (tab: string) => void;
  onUpdateTaskStatus: (taskId: string, status: any) => void;
  onViewTaskSource: (task: Task) => void;
  onOpenEmail: (email: EmailMessage) => void;
}

export const TodayMorningBrief: React.FC<TodayMorningBriefProps> = ({
  tasks,
  emails,
  newsList,
  userRole = 'coordinateur',
  onNavigateTab,
  onUpdateTaskStatus,
  onViewTaskSource,
  onOpenEmail,
}) => {
  const [briefing, setBriefing] = useState<MorningBriefing>(INITIAL_MORNING_BRIEF);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [livePasses, setLivePasses] = useState<MountainPassLive[]>([]);
  const [isLoadingPasses, setIsLoadingPasses] = useState(false);

  useEffect(() => {
    loadPassesWeather();
  }, []);

  const loadPassesWeather = async () => {
    setIsLoadingPasses(true);
    try {
      const data = await fetchLivePassesWeather();
      setLivePasses(data);
    } catch (e) {
      console.warn('Erreur chargement météo:', e);
    } finally {
      setIsLoadingPasses(false);
    }
  };

  const isCoordinateur = userRole === 'coordinateur';

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const urgentTasks = tasks.filter((t) => t.priority === 'p0' && t.status !== 'completed');
  const dueTodayTasks = tasks.filter((t) => t.status !== 'completed');
  const pendingEmails = emails.filter((e) => e.replyStatus === 'pending' || e.replyStatus === 'drafted');
  const highImpactNews = newsList.filter((n) => n.impactLevel === 'fort');

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n’est pas supportée sur ce navigateur.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(briefing.summary);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const regenerateAIBrief = async () => {
    setIsRegenerating(true);
    try {
      setTimeout(() => {
        setBriefing((prev) => ({
          ...prev,
          summary: `Synthèse FFMC 06 actualisée à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} : ${urgentTasks.length} urgence(s) active(s) sur le terrain, dont le dossier prioritaire de la RM6202. ${pendingEmails.length} proposition(s) de réponse par email sont prêtes pour validation. Suivi attentif de la parution des arrêtés ZFE sur la métropole niçoise.`,
        }));
        setIsRegenerating(false);
      }, 600);
    } catch {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intranet Welcome Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="capitalize">{todayStr}</span>
              <span className="text-slate-400 dark:text-zinc-600">•</span>
              <span>Synthèse du Conseil d'Administration</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bonjour aux militants du Conseil d'Administration de la FFMC 06
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
              {briefing.summary}
            </p>
          </div>

          {/* Quick Voice / Refresh controls */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition border shadow-xs ${
                isSpeaking
                  ? 'bg-red-700 text-white border-red-600 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700'
              }`}
              title="Lecture audio du briefing"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              <span>{isSpeaking ? 'Arrêter la lecture' : 'Écouter la synthèse'}</span>
            </button>

            {isCoordinateur && (
              <button
                onClick={regenerateAIBrief}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Actualisation...' : 'Rafraîchir synthèse IA'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100 dark:border-zinc-800">
          <div
            onClick={() => onNavigateTab(isCoordinateur ? 'dashboard' : 'shares')}
            className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Urgences P0</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-700 dark:text-red-400">{urgentTasks.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">actives</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab(isCoordinateur ? 'inbox' : 'shares')}
            className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Courrier privé à relire</span>
              <MailCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingEmails.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">propositions</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab(isCoordinateur ? 'dashboard' : 'shares')}
            className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Dossiers ouverts</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{dueTodayTasks.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">en cours</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('news')}
            className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-900/60 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Veille réglementaire</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{highImpactNews.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">impacts forts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Actions & Road/Passes Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Actions prioritaires du jour (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
              Points chauds et actions prioritaires du CA
            </h3>
            {isCoordinateur && (
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>Tableau des dossiers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                Aucune urgence critique P0 en suspens.
              </div>
            ) : (
              urgentTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 shadow-xs hover:shadow-sm transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                          {t.priority.toUpperCase()} · URGENT
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          Référent : <strong className="text-slate-800 dark:text-zinc-200">{t.assignee}</strong>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{t.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{t.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <button
                      onClick={() => onViewTaskSource(t)}
                      className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      <span>Origine : {t.sourceTitle || t.sourceType}</span>
                    </button>

                    {isCoordinateur && (
                      <button
                        onClick={() => onUpdateTaskStatus(t.id, 'completed')}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold text-xs flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Terminer l'action</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Other high priority actions */}
            {tasks
              .filter((t) => t.priority === 'p1' && t.status !== 'completed')
              .slice(0, 2)
              .map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                        P1
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{t.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {t.assignee} • Échéance : {t.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewTaskSource(t)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                    title="Voir traçabilité"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Right Column: Praticabilité Cols 06 & Dernières publications (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Météo & Cols du 06 */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-red-700 dark:text-red-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                  Météo & Praticabilité des Cols du 06
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Direct Open-Meteo
                </span>
                <button
                  onClick={loadPassesWeather}
                  disabled={isLoadingPasses}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition"
                  title="Rafraîchir les relevés météo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPasses ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(livePasses.length > 0 ? livePasses : briefing.weatherMountainPasses).map((pass: any) => {
                const isDelicat = pass.status === 'Délicat';
                const isTravaux = pass.status === 'Travaux';
                const hasTemp = typeof pass.temp === 'number';
                return (
                  <div
                    key={pass.col}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">{pass.col}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isDelicat
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : isTravaux
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {pass.status}
                      </span>
                    </div>

                    {hasTemp && (
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                        <span className="flex items-center gap-1 text-slate-900 dark:text-white">
                          <Thermometer className="w-3.5 h-3.5 text-red-600" />
                          {pass.temp}°C
                        </span>
                        {pass.windGusts > 0 && (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-normal">
                            <Wind className="w-3 h-3 text-blue-500" />
                            {pass.windGusts} km/h
                          </span>
                        )}
                        {pass.weatherDesc && (
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">
                            ({pass.weatherDesc})
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 leading-tight">{pass.details}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Veille clé récente */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Actualités & Arrêtés Clés
              </h3>
              <button
                onClick={() => onNavigateTab('news')}
                className="text-[11px] text-red-700 dark:text-red-400 font-semibold hover:underline"
              >
                Voir toute la veille →
              </button>
            </div>

            <div className="space-y-2">
              {newsList.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.source}</span>
                    <span className="text-slate-400 dark:text-zinc-500">
                      {new Date(item.publishedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
