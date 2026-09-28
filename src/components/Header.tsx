import React from 'react';
import {
  Shield,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Newspaper,
  Calendar,
  Sliders,
  Sun,
  Share2,
  Eye,
  Lock,
  UserCheck,
  Moon,
  Database,
  Radio,
  Users,
} from 'lucide-react';
import { CronConfig, UserRole, CAMember } from '../types';
import { ChevronDown, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cronConfig: CronConfig;
  onTriggerSync: () => void;
  isSyncing: boolean;
  urgentTasksCount: number;
  pendingEmailsCount: number;
  unreadNewsCount: number;
  activeSharesCount: number;
  userRole: UserRole;
  onToggleUserRole: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenConnections?: () => void;
  currentUser?: CAMember;
  onOpenUserModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cronConfig,
  onTriggerSync,
  isSyncing,
  urgentTasksCount,
  pendingEmailsCount,
  unreadNewsCount,
  activeSharesCount,
  userRole,
  onToggleUserRole,
  isDarkMode,
  onToggleDarkMode,
  onOpenConnections,
  currentUser,
  onOpenUserModal,
}) => {
  const isCoordinateur = userRole === 'coordinateur';

  // Navigation items matching the intranet specification
  const navItems = [
    {
      id: 'today',
      label: 'Aujourd’hui',
      icon: Sun,
      badge: urgentTasksCount > 0 ? urgentTasksCount : undefined,
      badgeColor: 'bg-red-600',
    },
    {
      id: 'dashboard',
      label: 'Dossiers & Actions',
      icon: Layers,
      restrictedForMember: true,
    },
    {
      id: 'inbox',
      label: 'Courrier privé',
      icon: Mail,
      badge: pendingEmailsCount > 0 ? pendingEmailsCount : undefined,
      badgeColor: 'bg-amber-600',
      restrictedForMember: true,
    },
    {
      id: 'meetings',
      label: 'Réunions du CA',
      icon: Calendar,
      restrictedForMember: true,
    },
    {
      id: 'shares',
      label: 'Partages au CA',
      icon: Share2,
      badge: activeSharesCount > 0 ? activeSharesCount : undefined,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'team',
      label: 'Équipe & Acteurs CA',
      icon: Users,
      restrictedForMember: true,
    },
    {
      id: 'news',
      label: 'News moto & politique',
      icon: Newspaper,
      badge: unreadNewsCount > 0 ? unreadNewsCount : undefined,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'cron',
      label: 'Surveillance & Cron',
      icon: Sliders,
      restrictedForMember: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm transition-colors duration-200">
      {/* Top Banner with Identity, Role Switcher & System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity: FFMC 06 · Espace CA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-700 text-white font-extrabold text-base shadow-sm shrink-0">
            <span>06</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                FFMC 06 <span className="font-light text-slate-400 dark:text-zinc-500">·</span>{' '}
                <span className="text-red-700 dark:text-red-400">Espace CA</span>
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                Intranet
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Espace de travail du conseil d’administration de la FFMC 06
            </p>
          </div>
        </div>

        {/* Right side controls: Role preview, DB indicator, Sync & Dark Mode */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status indicators */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-medium">Accès CA Sécurisé</span>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <Radio className="w-3 h-3 text-red-600" />
            <span>Veille : {cronConfig.intervalMinutes}m</span>
          </div>

          {/* User Profile & Connection Button */}
          {currentUser && onOpenUserModal && (
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 transition shadow-xs"
              title="Gérer les utilisateurs, changer de compte ou se connecter par email"
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shadow-xs ${
                  currentUser.avatarColor || 'bg-red-700 text-white'
                }`}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-xs leading-none flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                  {currentUser.role === 'coordinateur' ? 'Coordinateur' : 'Membre CA'}
                </div>
              </div>
            </button>
          )}

          {/* Role Preview Button (explained in README: "Le bouton 'Voir la vue membre du CA' permet au coordinateur de prévisualiser la lecture seule.") */}
          <button
            onClick={onToggleUserRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
              isCoordinateur
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
            }`}
            title="Basculer entre la vue complète coordinateur et la prévisualisation membre du CA"
          >
            {isCoordinateur ? (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>Voir la vue membre du CA</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Retour mode Coordinateur</span>
              </>
            )}
          </button>

          {/* Connexions & Données Directes Modal Button */}
          {onOpenConnections && (
            <button
              onClick={onOpenConnections}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-zinc-700 bg-white hover:bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition shadow-xs"
              title="Centre des Connexions (Météo cols, Supabase, Gmail, RSS)"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Connexions</span>
            </button>
          )}

          {/* Sync Trigger button */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isSyncing
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 shadow-sm active:scale-95'
            }`}
            title="Actualiser les données et lancer la relève Gmail / RSS"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Relève...' : 'Actualiser'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
            title={isDarkMode ? 'Passer en thème clair' : 'Passer en thème sombre'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-zinc-800/80 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !isCoordinateur && item.restrictedForMember;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isRestricted) {
                    alert(
                      "Section privée réservée au Coordinateur. En mode 'Membre du CA', seuls les partages validés, la synthèse et la veille sont accessibles."
                    );
                    return;
                  }
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isRestricted
                    ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600'
                    : isActive
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-red-700 dark:text-red-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                />
                <span>{item.label}</span>

                {isRestricted && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}

                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white leading-tight ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-700 dark:bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
