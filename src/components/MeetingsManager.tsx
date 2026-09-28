import React, { useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  ChevronRight,
  ListTodo,
  ExternalLink,
} from 'lucide-react';
import { Meeting, Task } from '../types';

interface MeetingsManagerProps {
  meetings: Meeting[];
  tasks: Task[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onViewTaskSource: (task: Task) => void;
}

export const MeetingsManager: React.FC<MeetingsManagerProps> = ({
  meetings,
  tasks,
  onAddMeeting,
  onUpdateMeeting,
  onAddTask,
  onViewTaskSource,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [isExtractTaskModalOpen, setIsExtractTaskModalOpen] = useState(false);

  // New action form state
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Antoine (Coordinateur)');
  const [newActionDueDate, setNewActionDueDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [newActionPriority, setNewActionPriority] = useState<'p0' | 'p1' | 'p2' | 'p3'>('p1');

  // New meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingType, setNewMeetingType] = useState<Meeting['type']>('bureau');
  const [newMeetingDate, setNewMeetingDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );
  const [newMeetingLocation, setNewMeetingLocation] = useState('Maison des Associations Garibaldi, Nice');
  const [newMeetingAttendees, setNewMeetingAttendees] = useState('Antoine, Jean-Marc, Sophie, Marc');
  const [newMeetingAgenda, setNewMeetingAgenda] = useState(
    '1. Bilan des actions du mois\n2. Dossiers voirie urgents\n3. Points financiers et adhésions\n4. Questions diverses'
  );

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const linkedTasks = tasks.filter((t) => t.sourceType === 'meeting' && t.sourceId === selectedMeeting?.id);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;

    const created: Meeting = {
      id: `mtg-${Date.now()}`,
      title: newMeetingTitle.trim(),
      type: newMeetingType,
      date: newMeetingDate,
      location: newMeetingLocation,
      status: 'scheduled',
      attendees: newMeetingAttendees.split(',').map((s) => s.trim()),
      agenda: newMeetingAgenda.split('\n').filter(Boolean),
    };

    onAddMeeting(created);
    setSelectedMeetingId(created.id);
    setIsNewMeetingModalOpen(false);
  };

  const handleCreateActionFromMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !newActionTitle.trim()) return;

    onAddTask({
      title: newActionTitle.trim(),
      description: `Action décidée en réunion du Bureau FFMC 06 : "${selectedMeeting.title}"`,
      status: 'todo',
      priority: newActionPriority,
      assignee: newActionAssignee,
      dueDate: newActionDueDate,
      sourceType: 'meeting',
      sourceId: selectedMeeting.id,
      sourceTitle: selectedMeeting.title,
      sourceSnippet: `Extrait de la réunion du ${new Date(selectedMeeting.date).toLocaleDateString('fr-FR')}`,
      tags: ['Réunion', selectedMeeting.type],
    });

    setNewActionTitle('');
    setIsExtractTaskModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Réunions du CA & Commissions FFMC 06
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ordres du jour, comptes-rendus, PV de réunions et extraction immédiate des tâches opérationnelles
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewMeetingModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Planifier une réunion</span>
        </button>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Meetings List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-3 bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
              Calendrier des réunions ({meetings.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-y-auto max-h-[600px]">
            {meetings.map((m) => {
              const isSelected = m.id === selectedMeeting?.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-l-4 border-red-600'
                      : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                      {new Date(m.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                        m.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {m.status === 'completed' ? 'Tenue' : 'Planifiée'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 line-clamp-1 mb-1">
                    {m.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{m.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Meeting Details & Actions (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs p-6 space-y-6">
          {selectedMeeting ? (
            <>
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase font-semibold border border-slate-200 dark:border-zinc-700">
                      Type : {selectedMeeting.type}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {new Date(selectedMeeting.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedMeeting.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{selectedMeeting.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsExtractTaskModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Extraire une action</span>
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Membres & Participants ({selectedMeeting.attendees.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeeting.attendees.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda / Ordre du jour */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Ordre du jour arrêté
                </h4>
                <ul className="space-y-1.5">
                  {selectedMeeting.agenda.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 flex items-start gap-2"
                    >
                      <span className="font-mono text-slate-400 dark:text-zinc-500 font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary / Compte-rendu */}
              {selectedMeeting.summary && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Compte-rendu des délibérations & décisions
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {selectedMeeting.summary}
                  </div>
                </div>
              )}

              {/* Actions / Tasks extracted from this meeting */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Actions et engagements issus de cette réunion ({linkedTasks.length})
                  </h4>
                </div>

                {linkedTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                    Aucune tâche n'a encore été extraite de cette réunion. Cliquez sur "Extraire une action".
                  </p>
                ) : (
                  <div className="space-y-2">
                    {linkedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Assigné : <strong className="text-slate-700 dark:text-zinc-300">{t.assignee}</strong> • Échéance : {t.dueDate}
                          </span>
                        </div>
                        <button
                          onClick={() => onViewTaskSource(t)}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition"
                          title="Voir traçabilité"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">
              Sélectionnez une réunion.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Meeting */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Planifier une nouvelle réunion FFMC 06
              </h3>
              <button
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Titre de la réunion *</label>
                <input
                  type="text"
                  required
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="ex: Réunion extraordinaire - Préparation manif Nice"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Type</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="bureau">Réunion de Bureau</option>
                    <option value="ag">Assemblée Générale</option>
                    <option value="commission_voirie">Commission Voirie</option>
                    <option value="reunion_partenaires">Concertation Mairie / Métropole</option>
                    <option value="preparation_manif">Préparation Manif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Date et heure</label>
                  <input
                    type="datetime-local"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Lieu</label>
                <input
                  type="text"
                  value={newMeetingLocation}
                  onChange={(e) => setNewMeetingLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Participants (séparés par virgules)</label>
                <input
                  type="text"
                  value={newMeetingAttendees}
                  onChange={(e) => setNewMeetingAttendees(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Points à l'ordre du jour (un par ligne)</label>
                <textarea
                  rows={4}
                  value={newMeetingAgenda}
                  onChange={(e) => setNewMeetingAgenda(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Extract Action From Meeting */}
      {isExtractTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-600" />
                Extraire une action de cette réunion
              </h3>
              <button
                onClick={() => setIsExtractTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActionFromMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Intitulé de l'action *</label>
                <input
                  type="text"
                  required
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="ex: Commander 150 drapeaux FFMC 06 pour la manif"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Responsable</label>
                  <select
                    value={newActionAssignee}
                    onChange={(e) => setNewActionAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Antoine (Coordinateur)">Antoine (Coordinateur)</option>
                    <option value="Jean-Marc (Commission Voirie)">Jean-Marc (Commission Voirie)</option>
                    <option value="Sophie (Trésorière/Adhésions)">Sophie (Trésorière/Adhésions)</option>
                    <option value="Marc (Relations Presse)">Marc (Relations Presse)</option>
                    <option value="Bureau FFMC 06">Bureau FFMC 06</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Priorité</label>
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="p0">🔴 P0 - Urgent</option>
                    <option value="p1">🟠 P1 - Important</option>
                    <option value="p2">🔵 P2 - Normal</option>
                    <option value="p3">⚪ P3 - Basse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-semibold mb-1">Échéance</label>
                <input
                  type="date"
                  value={newActionDueDate}
                  onChange={(e) => setNewActionDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExtractTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
