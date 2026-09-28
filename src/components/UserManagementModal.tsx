import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  UserCheck,
  Mail,
  Plus,
  Key,
  CheckCircle2,
  Copy,
  Users,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  Lock,
  Share2,
  Check,
  LogOut,
} from 'lucide-react';
import { CAMember, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CAMember;
  caMembers: CAMember[];
  onSelectUser: (user: CAMember) => void;
  onAddMember: (newMember: Omit<CAMember, 'id'>) => void;
  onUpdateMember: (updatedMember: CAMember) => void;
  onDeleteMember: (id: string) => void;
  onLogout?: () => void;
}

// Password generator utility
export function generateSecurePassword(type: 'motard' | 'strong' | 'pin' = 'motard'): string {
  if (type === 'pin') {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  if (type === 'motard') {
    const prefixes = ['Gaz', 'Col', 'Moto', 'Route', 'Asphalte', 'Guidon', 'Vence', 'Turini', 'Braus', 'Bonette'];
    const suffixes = ['Secu', 'Vigilance', 'FFMC', 'Motard', 'Solidarite', '06', 'Azur'];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const chars = '!#$?*';
    const spec = chars[Math.floor(Math.random() * chars.length)];
    const p1 = prefixes[Math.floor(Math.random() * prefixes.length)];
    const p2 = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${p1}-${p2}${randomNum}${spec}`;
  }

  // Alphanumeric strong
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  caMembers,
  onSelectUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onLogout,
}) => {
  const isCoordinator = currentUser.role === 'coordinateur';
  const [activeTab, setActiveTab] = useState<'members' | 'add' | 'login'>('members');

  // Editing state for an actor
  const [editingMember, setEditingMember] = useState<CAMember | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('membre');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState(() => generateSecurePassword('motard'));

  // Member Login with Password form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyMemberAccessCard = (member: CAMember) => {
    const cardText = `🏍️ FFMC 06 — Fiche de connexion Espace CA
---------------------------------------------
Bénévole : ${member.name}
Rôle : ${member.role === 'coordinateur' ? 'Coordinateur Général' : 'Membre du CA'} (${member.title})
Email : ${member.email}
${member.phone ? `Téléphone : ${member.phone}\n` : ''}Mot de passe d'accès : ${member.password || '(non défini)'}
---------------------------------------------
Lien intranet : ${window.location.origin}${window.location.pathname}
Ne partagez pas ces identifiants en dehors du CA.`;

    navigator.clipboard.writeText(cardText);
    setCopiedCardId(member.id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  const handleQuickGeneratePasswordForMember = (member: CAMember) => {
    const freshPass = generateSecurePassword('motard');
    onUpdateMember({
      ...member,
      password: freshPass,
    });
    copyToClipboard(freshPass, `pwd-${member.id}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  const handleCreateMember = (e: React.FormEvent) => {
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
    setActiveTab('members');
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const emailInput = loginEmail.trim().toLowerCase();
    const matched = caMembers.find(
      (m) => m.email.toLowerCase() === emailInput || m.name.toLowerCase() === emailInput
    );

    if (!matched) {
      setLoginError("Aucun membre du CA trouvé avec cet email ou ce nom.");
      return;
    }

    if (matched.password && matched.password !== loginPassword.trim()) {
      setLoginError("Mot de passe incorrect pour ce membre.");
      return;
    }

    onSelectUser(matched);
    setLoginSuccess(`Connecté avec succès en tant que ${matched.name} !`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Gestion des Acteurs & Accès CA FFMC 06
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Mode Autonome Direct
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Connecté actuellement : <strong className="text-slate-800 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.role === 'coordinateur' ? 'Coordinateur' : 'Membre CA'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 px-4 sm:px-6 pt-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('members');
                setEditingMember(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Acteurs du CA ({caMembers.length})</span>
            </button>

            {isCoordinator && (
              <button
                onClick={() => {
                  setActiveTab('add');
                  setEditingMember(null);
                }}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nouvel Acteur / Rôle</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('login');
                setEditingMember(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Connexion avec Mot de passe</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block pb-2">
            {isCoordinator ? (
              <span className="text-red-700 dark:text-red-400 font-medium">
                👑 Droits Coordinateur : Modification et génération activées
              </span>
            ) : (
              <span>Vue membre (Lecture)</span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* TAB 1: MEMBERS LIST & EDITING */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Coordinator explanation notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-700 dark:text-red-400" />
                    <span>Contrôle direct des acteurs et des mots de passe</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 text-[11px]">
                    En tant que coordinateur, vous pouvez modifier les rôles, noms, commissions et générer des mots de passe instantanés sans aucune configuration serveur.
                  </p>
                </div>
                {isCoordinator && (
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un acteur</span>
                  </button>
                )}
              </div>

              {/* Editing Form Modal Card (when modifying an actor) */}
              {editingMember && (
                <form
                  onSubmit={handleSaveEdit}
                  className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border-2 border-red-500 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      <span>Modifier l'acteur : {editingMember.name}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Nom & Prénom :
                      </label>
                      <input
                        type="text"
                        required
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Rôle FFMC 06 :
                      </label>
                      <select
                        value={editingMember.role}
                        onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      >
                        <option value="coordinateur">👑 Coordinateur (Accès complet & administration)</option>
                        <option value="membre">Membre du CA (Vue partagée & décisions)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Titre / Commission :
                      </label>
                      <input
                        type="text"
                        value={editingMember.title}
                        onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Email :
                      </label>
                      <input
                        type="email"
                        required
                        value={editingMember.email}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Téléphone :
                      </label>
                      <input
                        type="tel"
                        value={editingMember.phone || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Mot de passe de l'acteur :
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingMember({
                              ...editingMember,
                              password: generateSecurePassword('motard'),
                            })
                          }
                          className="text-[10px] text-red-700 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Générer</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingMember.password || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enregistrer les modifications</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Members Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caMembers.map((member) => {
                  const isCurrent = member.id === currentUser.id;
                  const isCoord = member.role === 'coordinateur';
                  const showPass = visiblePasswords[member.id];
                  const hasPassword = Boolean(member.password);

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 ring-1 ring-red-500 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        {/* Header of card */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                                member.avatarColor || 'bg-slate-700 text-white'
                              }`}
                            >
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {member.name}
                                </h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 rounded">
                                    Session active
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                                {member.title}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                              isCoord
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-900'
                                : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            {isCoord ? '👑 Coordinateur' : 'Membre CA'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-zinc-400">
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

                          {/* Password Box */}
                          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 shrink-0">
                                Pass :
                              </span>
                              <span className="font-mono text-xs text-slate-900 dark:text-white truncate">
                                {hasPassword
                                  ? showPass
                                    ? member.password
                                    : '••••••••••••'
                                  : '(non configuré)'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {hasPassword && (
                                <>
                                  <button
                                    onClick={() => togglePasswordVisibility(member.id)}
                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-700"
                                    title={showPass ? 'Masquer' : 'Afficher'}
                                  >
                                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(member.password || '', member.id)}
                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-700"
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

                              {isCoordinator && (
                                <button
                                  onClick={() => handleQuickGeneratePasswordForMember(member)}
                                  className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-semibold flex items-center gap-1"
                                  title="Générer un nouveau mot de passe fort"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Régénérer</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        {/* Switch user button */}
                        <button
                          onClick={() => onSelectUser(member)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                            isCurrent
                              ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-default'
                              : 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Actif' : 'Basculer'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Copy Access Card button */}
                          <button
                            onClick={() => copyMemberAccessCard(member)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-1"
                            title="Copier la fiche complète (Email + Pass) pour lui envoyer par WhatsApp / SMS"
                          >
                            {copiedCardId === member.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[11px] text-emerald-600 font-semibold">Fiche copiée !</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3 h-3" />
                                <span className="text-[11px]">Transmettre</span>
                              </>
                            )}
                          </button>

                          {/* Coordinator edit / delete */}
                          {isCoordinator && (
                            <>
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                                title="Modifier cet acteur"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {caMembers.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Confirmer la suppression de ${member.name} du CA ?`)) {
                                      onDeleteMember(member.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-400 transition"
                                  title="Supprimer cet acteur"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADD ACTOR FORM */}
          {activeTab === 'add' && isCoordinator && (
            <form onSubmit={handleCreateMember} className="space-y-4 max-w-xl mx-auto">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs">
                <p className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-red-700" />
                  <span>Ajouter un nouveau membre au Conseil d'Administration</span>
                </p>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                  Le membre recevra son rôle et un mot de passe généré automatiquement pour accéder aux synthèses et dossiers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Nom & Prénom :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Adresse Email :
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: j.dupont@ffmc06.fr"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Rôle attribué :
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="membre">Membre du CA (Vue partagée & décisions)</option>
                    <option value="coordinateur">👑 Coordinateur (Administration complète & Gmail)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Titre / Commission :
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Référent Voirie Grasse / Sécurité"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Téléphone (optionnel) :
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: 06 12 34 56 78"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                {/* Password generator section */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Mot de passe généré pour ce membre :</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateSecurePassword('motard'))}
                        className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-amber-300 text-amber-900 dark:text-amber-200 text-[10px] font-semibold flex items-center gap-1 hover:bg-amber-100"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Style Motard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateSecurePassword('strong'))}
                        className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-amber-300 text-amber-900 dark:text-amber-200 text-[10px] font-semibold flex items-center gap-1 hover:bg-amber-100"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Complexe</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-950 font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Créer et enregistrer cet acteur</span>
              </button>
            </form>
          )}

          {/* TAB 3: PASSWORD LOGIN (NO SUPABASE REQUIRED) */}
          {activeTab === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 max-w-md mx-auto py-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-700" />
                  <span>Connexion par Mot de passe du CA</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Chaque membre du bureau dispose de son mot de passe direct. Aucun compte externe ni Supabase n'est requis.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Email ou Nom du membre :
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Marc ou voirie.ffmc06@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Mot de passe :
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 text-xs">
                  {loginError}
                </div>
              )}

              {loginSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Gestion locale sécurisée FFMC 06 · Stockage persistant immédiat</span>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
