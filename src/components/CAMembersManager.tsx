import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2,
  UserCheck,
  Search,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CAMember, UserRole } from '../types';
import { generateSecurePassword } from './UserManagementModal';

interface CAMembersManagerProps {
  caMembers: CAMember[];
  currentUser: CAMember;
  onSelectUser: (user: CAMember) => void;
  onAddMember: (newMember: Omit<CAMember, 'id'>) => void;
  onUpdateMember: (updatedMember: CAMember) => void;
  onDeleteMember: (id: string) => void;
}

export const CAMembersManager: React.FC<CAMembersManagerProps> = ({
  caMembers,
  currentUser,
  onSelectUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [editingMember, setEditingMember] = useState<CAMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Visibility & Copy states
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // New Member state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('membre');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState(() => generateSecurePassword('motard'));

  const filteredMembers = caMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyMemberAccessCard = (member: CAMember) => {
    const cardText = `🏍️ FFMC 06 — Identifiants d'accès Espace CA
---------------------------------------------
Bénévole : ${member.name}
Rôle : ${member.role === 'coordinateur' ? '👑 Coordinateur Général' : 'Membre du CA'} (${member.title})
Email : ${member.email}
${member.phone ? `Téléphone : ${member.phone}\n` : ''}Code d'accès / Mot de passe : ${member.password || '(non configuré)'}
---------------------------------------------
Lien intranet : ${window.location.origin}${window.location.pathname}
Connectez-vous avec votre adresse email et votre code d'accès.`;

    navigator.clipboard.writeText(cardText);
    setCopiedCardId(member.id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  const handleQuickGeneratePassword = (member: CAMember) => {
    const pass = generateSecurePassword('motard');
    onUpdateMember({
      ...member,
      password: pass,
    });
    copyToClipboard(pass, `pwd-${member.id}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const colors = [
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-cyan-600 text-white',
      'bg-violet-600 text-white',
      'bg-red-700 text-white',
      'bg-blue-600 text-white',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddMember({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      title: newTitle.trim() || (newRole === 'coordinateur' ? 'Coordinateur Général FFMC 06' : 'Membre du CA'),
      phone: newPhone.trim() || undefined,
      password: newPassword.trim() || generateSecurePassword('motard'),
      avatarColor: randomColor,
    });

    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setNewPhone('');
    setNewPassword(generateSecurePassword('motard'));
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Gestion des Acteurs & Accès du CA
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                  Vue Coordinateur
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                  100% Autonome (Sans Supabase)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Modifiez les noms, rôles et commissions des membres du bureau, et générez leurs mots de passe d'accès en un clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setEditingMember(null);
              }}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-2 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Fermer le formulaire' : 'Ajouter un acteur'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou commission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 text-[11px] font-medium mr-1">Rôle :</span>
            {(['all', 'coordinateur', 'membre'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterRole === r
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'Tous' : r === 'coordinateur' ? 'Coordinateurs' : 'Membres CA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE FORM CARD (Conditional) */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-red-500 p-5 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-700" />
              <span>Créer un nouvel acteur du CA</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Nom & Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Julien Rossi"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Adresse Email *
              </label>
              <input
                type="email"
                required
                placeholder="ex: julien.rossi@ffmc06.fr"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Rôle FFMC *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              >
                <option value="membre">Membre du CA (Vue partagée)</option>
                <option value="coordinateur">👑 Coordinateur (Administration & Gmail)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Commission / Titre
              </label>
              <input
                type="text"
                placeholder="ex: Référent Circuits & Infrastructures"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                placeholder="ex: 06 12 34 56 78"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Mot de passe généré :
                </label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generateSecurePassword('motard'))}
                  className="text-[10px] text-red-700 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Régénérer</span>
                </button>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer ce nouveau membre</span>
            </button>
          </div>
        </form>
      )}

      {/* EDITING FORM CARD (Conditional) */}
      {editingMember && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-amber-500 p-5 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              <span>Modification de : {editingMember.name}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingMember(null)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Nom & Prénom
              </label>
              <input
                type="text"
                required
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={editingMember.email}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Rôle
              </label>
              <select
                value={editingMember.role}
                onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="coordinateur">👑 Coordinateur (Administration & Gmail)</option>
                <option value="membre">Membre du CA (Vue partagée)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Commission / Titre
              </label>
              <input
                type="text"
                value={editingMember.title}
                onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={editingMember.phone || ''}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Mot de passe :
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingMember({
                      ...editingMember,
                      password: generateSecurePassword('motard'),
                    })
                  }
                  className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Générer</span>
                </button>
              </div>
              <input
                type="text"
                value={editingMember.password || ''}
                onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingMember(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of Actors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isCurrent = member.id === currentUser.id;
          const isCoord = member.role === 'coordinateur';
          const showPass = visiblePasswords[member.id];
          const hasPassword = Boolean(member.password);

          return (
            <div
              key={member.id}
              className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all p-5 flex flex-col justify-between gap-4 ${
                isCurrent
                  ? 'border-red-600 dark:border-red-500 ring-2 ring-red-500/20 shadow-md'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
              }`}
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                        member.avatarColor || 'bg-slate-700 text-white'
                      }`}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {member.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {member.title}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      isCoord
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900'
                        : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {isCoord ? '👑 Coordinateur' : 'Membre CA'}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {/* Password Widget */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Pass :</span>
                      <span className="font-mono text-xs text-slate-900 dark:text-white truncate">
                        {hasPassword
                          ? showPass
                            ? member.password
                            : '••••••••••••'
                          : '(non défini)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {hasPassword && (
                        <>
                          <button
                            onClick={() => togglePasswordVisibility(member.id)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500"
                            title={showPass ? 'Masquer' : 'Afficher'}
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(member.password || '', member.id)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500"
                            title="Copier le mot de passe"
                          >
                            {copiedId === member.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleQuickGeneratePassword(member)}
                        className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="Générer un mot de passe fort immédiatement"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Générer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectUser(member)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 cursor-default'
                      : 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Actif' : 'Basculer'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyMemberAccessCard(member)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-1"
                    title="Copier la fiche complète pour envoi WhatsApp / SMS"
                  >
                    {copiedCardId === member.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-semibold">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span className="text-[11px]">Fiche</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setIsAdding(false);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    title="Modifier cet acteur"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {caMembers.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Confirmer la suppression définitive de ${member.name} du CA ?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-400 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
