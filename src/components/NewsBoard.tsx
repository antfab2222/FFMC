import React, { useState } from 'react';
import {
  Newspaper,
  Search,
  Filter,
  ExternalLink,
  Plus,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowRight,
  Globe,
  MapPin,
  Clock,
} from 'lucide-react';
import { NewsItem, NewsSource, NewsCategory, NewsGeographicalScope, Task } from '../types';
import { refreshNewsFeeds } from '../services/rssService';
import { fetchLiveNewsRSS } from '../services/api';

interface NewsBoardProps {
  newsList: NewsItem[];
  onAddNews: (item: NewsItem) => void;
  onUpdateNews: (item: NewsItem) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigateTab: (tab: string) => void;
}

const SOURCE_COLORS: Record<NewsSource, { badge: string; text: string }> = {
  'Légifrance': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
  },
  'Sécurité Routière': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
  },
  'Métropole Nice Côte d’Azur': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  'FFMC Nationale': {
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
  },
  'Motomag': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
  },
  'DDTM 06': {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-400',
  },
};

export const NewsBoard: React.FC<NewsBoardProps> = ({
  newsList,
  onAddNews,
  onUpdateNews,
  onAddTask,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [view, setView] = useState<'news'|'network'|'ideas'>('news');
  const [isFetching, setIsFetching] = useState(false);
  const [selectedNewsForTask, setSelectedNewsForTask] = useState<NewsItem | null>(null);

  // Task creation form state from news
  const [taskAssignee, setTaskAssignee] = useState('À attribuer');
  const [taskPriority, setTaskPriority] = useState<'p0' | 'p1' | 'p2' | 'p3'>('p1');
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  const handleRefreshRSS = async () => {
    setIsFetching(true);
    try {
      const result = await refreshNewsFeeds();
      const data = await fetchLiveNewsRSS();
      if (data.items && data.items.length > 0) {
        data.items.forEach((item: NewsItem) => {
          onAddNews(item);
        });
      }
      setFeedback(`${result.added} nouvelle(s) actualité(s). ${result.errors.join(' · ')}`);
    } catch (e: any) { setFeedback(e.message); } finally {
      setIsFetching(false);
    }
  };

  const networkRx=/ffmc|antenne|motards en colère|relais motards|calmos|jti|assises|coordinateurs/i;
  const ideaRx=/action|opération|initiative|balade|relais|formation|manifestation|atelier|stand|campagne/i;
  const filteredNews = newsList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesGeo = geoFilter === 'all' || item.geographicalScope === geoFilter;
    const matchesImpact = impactFilter === 'all' || item.impactLevel === impactFilter;
    const network=networkRx.test(`${item.source} ${item.title} ${item.summary} ${item.topic||''}`) || item.origin==='mail';
    const matchesView=view==='news' ? true : view==='network' ? network : network && ideaRx.test(`${item.title} ${item.summary} ${item.topic||''}`);
    return matchesSearch && matchesSource && matchesGeo && matchesImpact && matchesView && (originFilter === 'all' || item.origin === originFilter);
  });

  const handleToggleBookmark = (item: NewsItem) => {
    onUpdateNews({
      ...item,
      bookmarked: !item.bookmarked,
    });
  };

  const handleCreateTaskFromNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewsForTask) return;

    onAddTask({
      title: `Action veille : ${selectedNewsForTask.title.slice(0, 65)}`,
      description: `Créée suite à la source publiée (${selectedNewsForTask.source}) : ${selectedNewsForTask.summary}`,
      status: 'todo',
      priority: taskPriority,
      assignee: taskAssignee,
      dueDate: taskDueDate,
      sourceType: 'news',
      sourceId: selectedNewsForTask.id,
      sourceTitle: selectedNewsForTask.title,
      sourceSnippet: selectedNewsForTask.summary,
      tags: ['Veille', selectedNewsForTask.source, selectedNewsForTask.category],
    });

    onUpdateNews({
      ...selectedNewsForTask,
      linkedTaskId: `tsk-linked-${Date.now()}`,
    });

    setSelectedNewsForTask(null);
    alert('Action créée et rattachée avec succès à cette actualité !');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner & Control */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              News moto & politique
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Sources publiques et courriers du réseau · Classement par sujet et périmètre
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            <Clock className="w-3 h-3 text-emerald-600" />
            Données sourcées
          </span>

          <button
            onClick={handleRefreshRSS}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Recherche...' : 'Actualiser le fil'}</span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <button onClick={()=>setView('news')} className={`p-3 rounded-xl border text-left ${view==='news'?'border-red-600 bg-red-50 dark:bg-red-950/20':'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}><strong>Actualités</strong><span className="block text-xs text-slate-500">Toute la veille moto, réglementaire et locale</span></button>
        <button onClick={()=>setView('network')} className={`p-3 rounded-xl border text-left ${view==='network'?'border-red-600 bg-red-50 dark:bg-red-950/20':'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}><strong>Réseau FFMC</strong><span className="block text-xs text-slate-500">National, antennes et courriers du réseau</span></button>
        <button onClick={()=>setView('ideas')} className={`p-3 rounded-xl border text-left ${view==='ideas'?'border-red-600 bg-red-50 dark:bg-red-950/20':'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}><strong>Idées à reprendre</strong><span className="block text-xs text-slate-500">Initiatives à étudier pour la FFMC 06</span></button>
      </div>
      {view==='ideas'&&<p className="text-xs p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">Ces éléments sont des pistes repérées dans le réseau, pas des décisions du CA. Utilisez « Créer une action » pour les adapter et les soumettre.</p>}
      {feedback && <p role="status" className="text-sm p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">{feedback}</p>}
      <div className="flex gap-2">{[['all','Toutes les informations'],['veille','Veille publique'],['mail','Courriers du réseau']].map(([value,label])=><button key={value} onClick={()=>setOriginFilter(value)} className={`px-3 py-2 rounded-lg text-xs ${originFilter===value?'bg-red-700 text-white':'bg-white dark:bg-zinc-900'}`}>{label}</button>)}</div>
      {!newsList.length && <p className="text-sm text-slate-500">Aucune actualité chargée. Actualisez le fil pour consulter les sources disponibles.</p>}
      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-center gap-2.5 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher décret, arrêté ZFE, CT2M, Col..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-red-600"
          />
        </div>

        {/* Geographical Scope Filter as described in README */}
        <select
          value={geoFilter}
          onChange={(e) => setGeoFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">Tout périmètre (Europe / France / Sud / 06)</option>
          <option value="06 - Alpes-Maritimes">06 - Alpes-Maritimes</option>
          <option value="Région Sud">Région Sud (PACA)</option>
          <option value="France">France</option>
          <option value="Europe">Europe</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">Toutes sources ({newsList.length})</option>
          {[...new Set(newsList.map(n=>n.source))].sort().map(source=><option key={source}>{source}</option>)}
        </select>

        <select
          value={impactFilter}
          onChange={(e) => setImpactFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">Tous impacts</option>
          <option value="fort">Impact Fort</option>
          <option value="moyen">Impact Moyen</option>
          <option value="faible">Impact Faible</option>
        </select>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((item) => {
          const sourceStyle = SOURCE_COLORS[item.source] || {
            badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
            text: 'text-slate-700 dark:text-zinc-300',
          };
          const isHighImpact = item.impactLevel === 'fort';

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                isHighImpact
                  ? 'border-red-200 dark:border-red-900/40 shadow-xs'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <div className="space-y-3">
                {/* Source, Geographical scope & Announcement type */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${sourceStyle.badge}`}>
                      {item.source}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium">
                      {item.geographicalScope || '06'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isHighImpact
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      Impact {item.impactLevel}
                    </span>

                    <button
                      onClick={() => handleToggleBookmark(item)}
                      className="p-1 rounded text-slate-400 hover:text-amber-500 transition"
                      title="Mettre en favori"
                    >
                      {item.bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Announcement Type Badge */}
                {item.announcementType && (
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    Nature : <span className="text-slate-800 dark:text-zinc-200 font-semibold">{item.announcementType}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {item.summary}
                </p>

                {/* Key Points */}
                {item.keyPoints && item.keyPoints.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                      Impact local & points clés :
                    </span>
                    <ul className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-0.5 list-disc list-inside">
                      {item.keyPoints.map((kp, idx) => (
                        <li key={idx} className="whitespace-pre-line">
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {item.sourceRefs && <details className="mt-3 text-xs"><summary className="cursor-pointer font-semibold">Sources et traçabilité ({item.sourceRefs.length})</summary>{item.sourceRefs.map((ref,i)=><a key={i} href={ref.url} target="_blank" rel="noreferrer" className="block underline my-2 break-words">{ref.label}{ref.date ? ` · ${ref.date}` : ''} ↗</a>)}</details>}
              {/* Card Footer: direct action, link, and search date */}
              <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 space-y-0.5">
                  <span>Parution : {new Date(item.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition"
                    title="Consulter la source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setSelectedNewsForTask(item)}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer action</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Task from News */}
      {selectedNewsForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-700 dark:text-red-400" />
                Créer une action liée à cette veille
              </h3>
              <button
                onClick={() => setSelectedNewsForTask(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedNewsForTask.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Source : {selectedNewsForTask.source}</p>
            </div>

            <form onSubmit={handleCreateTaskFromNews} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Référent désigné</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="À attribuer">À attribuer</option><option value="Antoine (Coordinateur)">Antoine (Coordinateur)</option>
                  <option value="Bureau FFMC 06">Bureau FFMC 06</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Priorité</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="p0">🔴 P0 - Urgence</option>
                    <option value="p1">🟠 P1 - Important</option>
                    <option value="p2">🔵 P2 - Normal</option>
                    <option value="p3">⚪ P3 - Basse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Échéance</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNewsForTask(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold"
                >
                  Valider l'action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
