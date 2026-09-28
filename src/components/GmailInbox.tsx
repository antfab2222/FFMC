import React, { useState } from 'react';
import {
  Mail,
  Search,
  Filter,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  RefreshCw,
  User,
  Shield,
  FileText,
  Check,
  Edit3,
  ThumbsUp,
  Tag,
  ArrowRight,
  Inbox,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { EmailMessage, Task, TaskPriority } from '../types';
import { MAIL_TAXONOMY, MailCategory } from '../types/mail-taxonomy';
import { analyzeEmailWithAI } from '../services/api';

interface GmailInboxProps {
  emails: EmailMessage[];
  onUpdateEmail: (email: EmailMessage) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onPrepareCAShare?: (share: { title: string; content: string; sourceTitle: string; sourceId: string }) => void;
  selectedEmailId?: string | null;
}

export const GmailInbox: React.FC<GmailInboxProps> = ({
  emails,
  onUpdateEmail,
  onAddTask,
  onPrepareCAShare,
  selectedEmailId: externalSelectedEmailId,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(
    externalSelectedEmailId || emails[0]?.id || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editableReply, setEditableReply] = useState<string>('');
  const [isEditingReply, setIsEditingReply] = useState(false);

  // New simulated incoming email form
  const [simSenderName, setSimSenderName] = useState('David Motard 06');
  const [simSenderEmail, setSimSenderEmail] = useState('david.motard@gmail.com');
  const [simSubject, setSimSubject] = useState('Signalement glissière guillotine virage Col de Vence');
  const [simBody, setSimBody] = useState(
    'Bonjour la FFMC 06, suite aux travaux récents sur la RD2 en montant au Col de Vence, le conseil départemental a remplacé une glissière sans poser le rail inférieur de sécurité motard. En cas de glissade en deux-roues, les poteaux constituent un piège mortel. Pouvez-vous intervenir ?'
  );

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  // Sync editable reply when selected email changes
  React.useEffect(() => {
    if (selectedEmail) {
      setEditableReply(selectedEmail.suggestedReply || '');
      setIsEditingReply(false);
    }
  }, [selectedEmailId, selectedEmail]);

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || email.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || email.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleSimulateIncomingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const result = await analyzeEmailWithAI({
        senderName: simSenderName,
        senderEmail: simSenderEmail,
        subject: simSubject,
        body: simBody,
      });

      const analysis = result.analysis;
      const newEmailId = `eml-${Date.now()}`;

      const newEmail: EmailMessage = {
        id: newEmailId,
        senderName: simSenderName,
        senderEmail: simSenderEmail,
        subject: simSubject,
        snippet: simBody.slice(0, 100) + '...',
        body: simBody,
        receivedAt: new Date().toISOString(),
        category: (analysis.category as MailCategory) || 'danger_voirie_infrastructure',
        priority: (analysis.priority as TaskPriority) || 'p1',
        impactAnalysis: analysis.impactAnalysis || 'Analyse effectuée par Gemini Assistant.',
        suggestedReply: analysis.suggestedReply,
        replyStatus: 'pending',
        isRead: false,
        tasksExtracted: analysis.tasks || [],
      };

      onUpdateEmail(newEmail);

      // Auto-extract tasks if available
      if (analysis.tasks && analysis.tasks.length > 0) {
        analysis.tasks.forEach((t: any) => {
          onAddTask({
            title: t.title,
            description: t.description || `Action issue de l'email de ${simSenderName}`,
            status: 'todo',
            priority: t.priority || 'p1',
            assignee: t.assignee || 'Jean-Marc (Commission Voirie)',
            dueDate: t.dueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            sourceType: 'email',
            sourceId: newEmailId,
            sourceTitle: simSubject,
            sourceSnippet: simBody.slice(0, 120),
            tags: ['Relève IA', 'Email', simSubject.includes('glissière') ? 'Voirie' : 'Contact'],
          });
        });
      }

      setSelectedEmailId(newEmailId);
      setIsSimulateModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveReply = () => {
    if (!selectedEmail) return;
    const updated: EmailMessage = {
      ...selectedEmail,
      suggestedReply: editableReply,
      replyStatus: 'approved',
    };
    onUpdateEmail(updated);
  };

  const handleSendReply = () => {
    if (!selectedEmail) return;
    const updated: EmailMessage = {
      ...selectedEmail,
      suggestedReply: editableReply,
      replyStatus: 'sent',
      isRead: true,
    };
    onUpdateEmail(updated);
    alert(`Email envoyé avec succès à ${selectedEmail.senderEmail} !\nValidation humaine confirmée.`);
  };

  const handleCreateTaskFromEmail = (extracted: {
    title: string;
    assignee: string;
    dueDate: string;
    priority: TaskPriority;
  }) => {
    if (!selectedEmail) return;
    onAddTask({
      title: extracted.title,
      description: `Action extraite de l'email de ${selectedEmail.senderName} (${selectedEmail.senderEmail})`,
      status: 'todo',
      priority: extracted.priority,
      assignee: extracted.assignee,
      dueDate: extracted.dueDate,
      sourceType: 'email',
      sourceId: selectedEmail.id,
      sourceTitle: selectedEmail.subject,
      sourceSnippet: selectedEmail.snippet,
      tags: ['Courrier', selectedEmail.category],
    });
    alert(`Tâche "${extracted.title}" ajoutée avec succès au tableau de bord !`);
  };

  const handlePrepareShare = () => {
    if (!selectedEmail) return;
    if (onPrepareCAShare) {
      onPrepareCAShare({
        title: `Synthèse courrier : ${selectedEmail.subject}`,
        content: `Objet : ${selectedEmail.subject}\nExpéditeur : ${selectedEmail.senderName} (${selectedEmail.senderEmail})\n\nRésumé & Impact FFMC 06 :\n${selectedEmail.impactAnalysis}\n\nRéponse validée par le coordinateur :\n"${selectedEmail.suggestedReply || 'En cours de rédaction'}"`,
        sourceTitle: selectedEmail.subject,
        sourceId: selectedEmail.id,
      });
    } else {
      alert("Partage préparé avec succès pour le Conseil d'Administration.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Courrier privé & Assistant d'Analyse (Gemini)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Surveillance serveur de la boîte coordinateur.ffmc06@gmail.com · Brouillons à relire
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Tester / Simuler un message</span>
          </button>
        </div>
      </div>

      {/* Main Mail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        {/* Left Column: Email List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-200 dark:border-zinc-800 space-y-2 bg-slate-50/70 dark:bg-zinc-950/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher dans les courriers..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="all">Toutes catégories</option>
                {Object.values(MAIL_TAXONOMY).map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="all">Priorités</option>
                <option value="p0">🔴 P0</option>
                <option value="p1">🟠 P1</option>
                <option value="p2">🔵 P2</option>
                <option value="p3">⚪ P3</option>
              </select>
            </div>
          </div>

          {/* Email items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Aucun email ne correspond aux filtres.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = email.id === selectedEmail?.id;
                const taxonomy = MAIL_TAXONOMY[email.category] || MAIL_TAXONOMY.adhesion_sympathisant;
                const isP0 = email.priority === 'p0';

                return (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmailId(email.id);
                      if (!email.isRead) {
                        onUpdateEmail({ ...email, isRead: true });
                      }
                    }}
                    className={`p-3.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-slate-100/90 dark:bg-zinc-800 border-l-4 border-red-700 dark:border-red-500'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {!email.isRead && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-red-600" />
                    )}

                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-900 dark:text-zinc-200 truncate max-w-[190px]">
                        {email.senderName}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px]">
                        {new Date(email.receivedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-semibold leading-tight line-clamp-1 mb-1 ${
                        isSelected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {email.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                      {email.snippet}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${taxonomy.badgeColor}`}>
                        {taxonomy.label}
                      </span>

                      {isP0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
                          P0 · URGENT
                        </span>
                      )}

                      {email.replyStatus === 'approved' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
                          ✓ Réponse validée
                        </span>
                      )}
                      {email.replyStatus === 'sent' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-semibold">
                          ✓ Envoyé
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Details & AI Assistant (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Email Header */}
              <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {selectedEmail.subject}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                      <span>De : <strong className="text-slate-800 dark:text-zinc-200">{selectedEmail.senderName}</strong></span>
                      <span>&lt;{selectedEmail.senderEmail}&gt;</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 dark:text-zinc-500 block font-mono">
                      {new Date(selectedEmail.receivedAt).toLocaleString('fr-FR')}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        selectedEmail.priority === 'p0'
                          ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      Priorité {selectedEmail.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* AI Impact Badge */}
                <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-amber-900 dark:text-amber-300">Analyse d'impact FFMC 06 (Assistant IA) :</span>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{selectedEmail.impactAnalysis}</p>
                  </div>
                </div>
              </div>

              {/* Email Raw Body */}
              <div className="p-5 space-y-2 border-b border-slate-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Contenu du courrier reçu :
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                  {selectedEmail.body}
                </div>
              </div>

              {/* Extracted Tasks from this email */}
              {selectedEmail.tasksExtracted && selectedEmail.tasksExtracted.length > 0 && (
                <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                      Actions détectées pour les dossiers ({selectedEmail.tasksExtracted.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {selectedEmail.tasksExtracted.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-zinc-100">{t.title}</p>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Assigné : <strong className="text-slate-700 dark:text-zinc-300">{t.assignee}</strong> • Échéance : {t.dueDate}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCreateTaskFromEmail(t)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3 h-3 text-emerald-600" />
                          <span>Ajouter aux dossiers</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Reply & Human Validation Panel */}
              <div className="p-5 space-y-3 bg-slate-50/50 dark:bg-zinc-900/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Proposition de réponse (Relecture obligatoire)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingReply(!isEditingReply)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingReply ? 'Fermer l’éditeur' : 'Modifier le texte'}</span>
                    </button>
                  </div>
                </div>

                {isEditingReply ? (
                  <textarea
                    rows={6}
                    value={editableReply}
                    onChange={(e) => setEditableReply(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-zinc-950 border border-red-300 dark:border-red-900/60 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none leading-relaxed font-sans"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed italic">
                    {editableReply || 'Aucune réponse rédigée.'}
                  </div>
                )}

                {/* Validation Actions and "Préparer un partage au CA" as in README */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Statut :{' '}
                      <strong className="text-amber-700 dark:text-amber-400">
                        {selectedEmail.replyStatus === 'approved'
                          ? 'Validé par le coordinateur'
                          : selectedEmail.replyStatus === 'sent'
                          ? 'Envoyé au destinataire'
                          : 'En attente de relecture'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action explicitly highlighted in README: "Courrier privé -> Préparer un partage au CA" */}
                    <button
                      onClick={handlePrepareShare}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Préparer une synthèse de ce courrier pour les membres du CA"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Préparer un partage au CA</span>
                    </button>

                    {selectedEmail.replyStatus !== 'approved' && selectedEmail.replyStatus !== 'sent' && (
                      <button
                        onClick={handleApproveReply}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valider</span>
                      </button>
                    )}

                    <button
                      onClick={handleSendReply}
                      className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
              Sélectionnez un email pour afficher l'analyse et la réponse.
            </div>
          )}
        </div>
      </div>

      {/* Simulate Incoming Email Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-700 dark:text-red-400" />
                Simuler un email entrant (Test d'analyse Gemini)
              </h3>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateIncomingEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Nom expéditeur</label>
                <input
                  type="text"
                  required
                  value={simSenderName}
                  onChange={(e) => setSimSenderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Email expéditeur</label>
                <input
                  type="email"
                  required
                  value={simSenderEmail}
                  onChange={(e) => setSimSenderEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Objet du message</label>
                <input
                  type="text"
                  required
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Contenu / Corps</label>
                <textarea
                  rows={4}
                  required
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isAnalyzing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAnalyzing ? 'Analyse Gemini...' : 'Recevoir et analyser'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
