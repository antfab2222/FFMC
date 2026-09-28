import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Eye,
  EyeOff,
  FileText,
  Clock,
  User,
  Shield,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  Calendar,
  Lock,
} from 'lucide-react';
import { CAShare, UserRole } from '../types';

interface CASharesManagerProps {
  shares: CAShare[];
  userRole: UserRole;
  onAddShare: (share: Omit<CAShare, 'id' | 'publishedAt'>) => void;
  onUpdateShare: (share: CAShare) => void;
  onDeleteShare: (shareId: string) => void;
}

const CATEGORY_LABELS: Record<CAShare['category'], { label: string; badge: string }> = {
  note_de_synthese: {
    label: 'Note de synthèse',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  courrier_valide: {
    label: 'Courrier validé',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  decision_reunion: {
    label: 'Décision de réunion',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
  communique: {
    label: 'Communiqué officiel',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
};

export const CASharesManager: React.FC<CASharesManagerProps> = ({
  shares,
  userRole,
  onAddShare,
  onUpdateShare,
  onDeleteShare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewShareModalOpen, setIsNewShareModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<CAShare | null>(null);

  // New share form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CAShare['category']>('note_de_synthese');

  const isCoordinateur = userRole === 'coordinateur';

  // For members, only active shares are visible
  const visibleShares = shares.filter((s) => {
    if (!isCoordinateur && s.status !== 'active') return false;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddShare({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      author: 'Antoine F. (Coordinateur)',
      status: 'active',
      sourceType: 'manual',
    });

    setNewTitle('');
    setNewContent('');
    setIsNewShareModalOpen(false);
  };

  const handleToggleStatus = (share: CAShare) => {
    onUpdateShare({
      ...share,
      status: share.status === 'active' ? 'archived' : 'active',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                <Share2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Partages au Conseil d’Administration
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {isCoordinateur
                    ? 'Notes, synthèses et courriers officiellement relus et partagés aux membres du CA'
                    : 'Espace de consultation des publications et décisions validées du CA'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCoordinateur ? (
              <button
                onClick={() => setIsNewShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau partage</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lecture seule (Membre CA)</span>
              </div>
            )}
          </div>
        </div>

        {/* Member preview note if coordinator in member mode */}
        {!isCoordinateur && (
          <div className="mt-3.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Vue Membre du CA :</strong> Seuls le titre et le texte validés et partagés par le coordinateur sont visibles. Les notes privées et courriers non relus restent confidentiels.
            </span>
          </div>
        )}
      </div>

      {/* Filter and search */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une note, décision, mot-clé..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-red-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">Toutes catégories ({shares.length})</option>
          <option value="note_de_synthese">Notes de synthèse</option>
          <option value="courrier_valide">Courriers validés</option>
          <option value="decision_reunion">Décisions de réunion</option>
          <option value="communique">Communiqués officiels</option>
        </select>
      </div>

      {/* Shares List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleShares.length === 0 ? (
          <div className="md:col-span-2 p-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-400 dark:text-zinc-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-600 dark:text-zinc-300">Aucun partage publié pour le moment.</p>
            <p className="text-xs mt-1 text-slate-400 dark:text-zinc-500">
              {isCoordinateur
                ? 'Cliquez sur "Nouveau partage" ou partagez un courrier validé depuis la boîte de réception.'
                : 'Les publications récentes du coordinateur apparaîtront ici.'}
            </p>
          </div>
        ) : (
          visibleShares.map((share) => {
            const catInfo = CATEGORY_LABELS[share.category] || CATEGORY_LABELS.note_de_synthese;
            const isArchived = share.status === 'archived';

            return (
              <div
                key={share.id}
                className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                  isArchived
                    ? 'opacity-60 border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.badge}`}>
                      {catInfo.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                        {new Date(share.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      {isCoordinateur && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            share.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {share.status === 'active' ? 'Au CA' : 'Retiré'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {share.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {share.content}
                  </p>

                  {share.sourceTitle && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">Origine :</span>
                      <span className="truncate">{share.sourceTitle}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
                    <User className="w-3 h-3" />
                    <span>{share.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedShare(share)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                    >
                      Lire la note complète
                    </button>

                    {isCoordinateur && (
                      <button
                        onClick={() => handleToggleStatus(share)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                          share.status === 'active'
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                        title={
                          share.status === 'active'
                            ? 'Retirer du CA (masquer aux membres)'
                            : 'Republier aux membres du CA'
                        }
                      >
                        {share.status === 'active' ? 'Retirer du CA' : 'Republier'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Read Full Note Modal */}
      {selectedShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  {CATEGORY_LABELS[selectedShare.category]?.label || 'Partage CA'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedShare.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 mt-1">
                  <span>Auteur : {selectedShare.author}</span>
                  <span>•</span>
                  <span>Publié le {new Date(selectedShare.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedShare(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
              {selectedShare.content}
            </div>

            {selectedShare.sourceTitle && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Source d'origine : </span>
                {selectedShare.sourceTitle}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedShare(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Share (Coordinator only) */}
      {isNewShareModalOpen && isCoordinateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-red-700 dark:text-red-400" />
                Préparer un nouveau partage au CA
              </h3>
              <button
                onClick={() => setIsNewShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Seuls le titre et le texte explicitement saisis ici seront consultables par les membres du CA.
            </p>

            <form onSubmit={handleCreateShare} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Titre du partage *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Note d'information : Avancement du dossier couloirs de bus Nice"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Catégorie
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="note_de_synthese">Note de synthèse</option>
                  <option value="courrier_valide">Courrier officiel validé</option>
                  <option value="decision_reunion">Décision / relevé de réunion</option>
                  <option value="communique">Communiqué de presse / média</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">
                  Texte à destination du CA *
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rédigez la synthèse ou les points clés destinés aux membres du conseil d'administration..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-red-600 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewShareModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs shadow-sm"
                >
                  Publier au CA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
