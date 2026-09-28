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
  ExternalLink,
  Users,
  LogOut,
  Sparkles,
  Phone,
  Send,
  AlertCircle,
} from 'lucide-react';
import { CAMember, UserRole } from '../types';
import { getSupabaseClient, getSupabaseConfig } from '../services/supabaseService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CAMember;
  caMembers: CAMember[];
  onSelectUser: (user: CAMember) => void;
  onAddMember: (newMember: Omit<CAMember, 'id'>) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  caMembers,
  onSelectUser,
  onAddMember,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'supabase_login' | 'add_member'>('switch');
  
  // Supabase Magic Link Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('membre');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const supabaseConfig = getSupabaseConfig();
  const supabase = getSupabaseClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    // Check if in known CA members
    const matched = caMembers.find((m) => m.email.toLowerCase() === loginEmail.trim().toLowerCase());
    
    setIsSendingLink(true);
    setLoginFeedback(null);

    try {
      if (supabase && supabaseConfig.key) {
        const { error } = await supabase.auth.signInWithOtp({
          email: loginEmail.trim(),
          options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
          },
        });
        if (error) throw error;
        setLoginFeedback({
          type: 'success',
          message: `Lien magique envoyé à ${loginEmail}. Vérifiez votre boîte mail pour vous connecter.`,
        });
      } else {
        // Local simulation if Supabase key is not yet set
        if (matched) {
          onSelectUser(matched);
          setLoginFeedback({
            type: 'success',
            message: `Connecté avec succès en tant que ${matched.name} (${matched.title}) !`,
          });
        } else {
          setLoginFeedback({
            type: 'success',
            message: `Simulation connexion réussie pour ${loginEmail} (Mode local). Pour activer les vrais liens par email, configurez la clé Supabase.`,
          });
        }
      }
    } catch (err: any) {
      setLoginFeedback({
        type: 'error',
        message: err.message || 'Erreur lors de l’envoi du lien magique.',
      });
    } finally {
      setIsSendingLink(false);
    }
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
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddMember({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      title: newTitle.trim() || (newRole === 'coordinateur' ? 'Coordinateur FFMC 06' : 'Membre du CA'),
      phone: newPhone.trim() || undefined,
      avatarColor: randomColor,
    });

    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setNewPhone('');
    setActiveTab('switch');
  };

  const sqlSnippet = `-- Commande SQL à exécuter dans Supabase > SQL Editor pour autoriser un membre :
-- Remplacez UUID_AUTH par l'identifiant Supabase du compte (créé dans Authentication > Users) :
INSERT INTO public.ca_members (user_id, display_name, role)
VALUES ('UUID_AUTH_ICI', '${currentUser.name}', '${currentUser.role}')
ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Espace Connexion & Membres du CA
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Identité active : <strong className="text-slate-700 dark:text-zinc-200">{currentUser.name}</strong> ({currentUser.title})
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
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'switch'
                ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Choisir un utilisateur ({caMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('supabase_login')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'supabase_login'
                ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Connexion Email (Lien magique)
          </button>
          <button
            onClick={() => setActiveTab('add_member')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'add_member'
                ? 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            + Ajouter un membre
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Sélectionnez votre profil pour basculer instantanément. Le rôle <strong>Coordinateur</strong> donne l'accès complet à la boîte Gmail privée et aux réglages, tandis que le rôle <strong>Membre du CA</strong> affiche les dossiers et partages validés.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caMembers.map((member) => {
                  const isCurrent = member.id === currentUser.id;
                  const isCoord = member.role === 'coordinateur';

                  return (
                    <div
                      key={member.id}
                      onClick={() => onSelectUser(member)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3 text-left ${
                        isCurrent
                          ? 'border-red-600 bg-red-50/60 dark:bg-red-950/20 ring-1 ring-red-600 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                          member.avatarColor || 'bg-slate-700 text-white'
                        }`}
                      >
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {member.name}
                          </h4>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded">
                              Actif
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                          {member.title}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-medium ${
                              isCoord
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {isCoord ? 'Coordinateur' : 'Membre CA'}
                          </span>
                          <span className="text-slate-400 dark:text-zinc-500 truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SQL script helper */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    Synchronisation Supabase RLS (`ca_members`)
                  </span>
                  <button
                    onClick={copySql}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 text-[10px] transition"
                  >
                    {copiedSql ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copié !' : 'Copier SQL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                  Pour accorder les droits d'écriture en base sécurisée Supabase, insérez l'UUID du compte utilisateur dans la table <code>public.ca_members</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'supabase_login' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Connexion sans mot de passe par Email (Magic Link)
                </p>
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  Entrez votre adresse email de bénévole du CA. Vous recevrez un lien sécurisé permettant de vous connecter directement sans aucun mot de passe à retenir.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Adresse email du membre :
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: coordinateur.ffmc06@gmail.com ou votre.nom@ffmc.fr"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              {loginFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    loginFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200'
                  }`}
                >
                  {loginFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{loginFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingLink || !loginEmail.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
              >
                {isSendingLink ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer le lien magique de connexion</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'add_member' && (
            <form onSubmit={handleCreateMember} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                Ajoutez un membre du Conseil d'Administration de la FFMC 06 pour lui attribuer des dossiers, lui envoyer des partages et lui configurer son rôle.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Prénom & Nom :
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Marc Dupont"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Adresse Email :
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: marc.dupont@ffmc06.fr"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Rôle FFMC :
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="membre">Membre du CA (Vue partagée)</option>
                    <option value="coordinateur">Coordinateur (Administration complète & Gmail)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Titre / Commission :
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Référent Antenne Antibes / Relais"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Numéro de téléphone (optionnel) :
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: 06 00 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer ce membre du CA</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sécurisé par Row Level Security Supabase</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
