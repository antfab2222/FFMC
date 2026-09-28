import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import {
  getStoredTasks,
  saveTasks,
  getStoredEmails,
  saveEmails,
  getStoredNews,
  saveNews,
  getStoredMeetings,
  saveMeetings,
  getStoredCronConfig,
  saveCronConfig,
  getStoredCronLogs,
  saveCronLogs,
  getStoredCAShares,
  saveCAShares,
  getStoredCAMembers,
  saveCAMembers,
  getStoredCurrentUser,
  saveCurrentUser,
  triggerCronSync,
} from './services/api';
import {
  Task,
  EmailMessage,
  NewsItem,
  Meeting,
  CronConfig,
  CronLog,
  TaskStatus,
  UserRole,
  CAShare,
  CAMember,
} from './types';
import { Header } from './components/Header';
import { TodayMorningBrief } from './components/TodayMorningBrief';
import { Dashboard } from './Dashboard';
import { GmailInbox } from './components/GmailInbox';
import { NewsBoard } from './components/NewsBoard';
import { MeetingsManager } from './components/MeetingsManager';
import { CASharesManager } from './components/CASharesManager';
import { AutomationCron } from './components/AutomationCronModal';
import { SourceTraceabilityModal } from './components/SourceTraceabilityModal';
import { ConnectionsModal } from './components/ConnectionsModal';
import { UserManagementModal } from './components/UserManagementModal';
import { CAMembersManager } from './components/CAMembersManager';
import { LoginPage } from './components/LoginPage';
import { fetchLiveNewsRSS } from './services/api';
import { getSupabaseSession, signOutSupabase } from './services/supabaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [userRole, setUserRole] = useState<UserRole>('coordinateur');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ffmc_theme') === 'dark';
  });

  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [emails, setEmails] = useState<EmailMessage[]>(getStoredEmails);
  const [newsList, setNewsList] = useState<NewsItem[]>(getStoredNews);
  const [meetings, setMeetings] = useState<Meeting[]>(getStoredMeetings);
  const [caShares, setCaShares] = useState<CAShare[]>(getStoredCAShares);
  const [cronConfig, setCronConfig] = useState<CronConfig>(getStoredCronConfig);
  const [cronLogs, setCronLogs] = useState<CronLog[]>(getStoredCronLogs);
  const [caMembers, setCaMembers] = useState<CAMember[]>(getStoredCAMembers);
  const [currentUser, setCurrentUser] = useState<CAMember>(getStoredCurrentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ffmc06_authenticated') === 'true';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModalTask, setActiveModalTask] = useState<Task | null>(null);
  const [activeEmailDetail, setActiveEmailDetail] = useState<EmailMessage | null>(null);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // Background fetch of real live news from FFMC & Motomag
  useEffect(() => {
    fetchLiveNewsRSS().then((res) => {
      if (res && res.items && res.items.length > 0) {
        setNewsList(res.items);
      }
    });
  }, []);

  // Check active Supabase session on startup
  useEffect(() => {
    getSupabaseSession().then((session) => {
      if (session?.user?.email) {
        setIsAuthenticated(true);
        localStorage.setItem('ffmc06_authenticated', 'true');
        const userEmail = session.user.email.toLowerCase();
        const matched = caMembers.find((m) => m.email.toLowerCase() === userEmail);
        if (matched) {
          setCurrentUser(matched);
          setUserRole(matched.role);
        }
      }
    }).catch(() => {});
  }, [caMembers]);

  // Synchronize Dark Mode with HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ffmc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ffmc_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveEmails(emails);
  }, [emails]);

  useEffect(() => {
    saveNews(newsList);
  }, [newsList]);

  useEffect(() => {
    saveMeetings(meetings);
  }, [meetings]);

  useEffect(() => {
    saveCAShares(caShares);
  }, [caShares]);

  useEffect(() => {
    saveCronConfig(cronConfig);
  }, [cronConfig]);

  useEffect(() => {
    saveCronLogs(cronLogs);
  }, [cronLogs]);

  useEffect(() => {
    saveCAMembers(caMembers);
  }, [caMembers]);

  useEffect(() => {
    saveCurrentUser(currentUser);
    setUserRole(currentUser.role);
  }, [currentUser]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch or select active user
  const handleSelectUser = (user: CAMember) => {
    setCurrentUser(user);
    setUserRole(user.role);
    showToast(`Connecté en tant que ${user.name} (${user.title})`);
  };

  const handleAddMember = (newMember: Omit<CAMember, 'id'>) => {
    const memberWithId: CAMember = {
      ...newMember,
      id: `usr-${Date.now()}`,
    };
    setCaMembers((prev) => [...prev, memberWithId]);
    showToast(`Membre ${newMember.name} ajouté au CA !`);
  };

  const handleUpdateMember = (updatedMember: CAMember) => {
    setCaMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    if (currentUser.id === updatedMember.id) {
      setCurrentUser(updatedMember);
      setUserRole(updatedMember.role);
    }
    showToast(`Acteur ${updatedMember.name} mis à jour`);
  };

  const handleDeleteMember = (id: string) => {
    if (caMembers.length <= 1) {
      showToast('Impossible de supprimer le dernier membre du CA.');
      return;
    }
    const memberToDelete = caMembers.find((m) => m.id === id);
    setCaMembers((prev) => prev.filter((m) => m.id !== id));
    if (currentUser.id === id) {
      const fallback = caMembers.find((m) => m.id !== id) || caMembers[0];
      setCurrentUser(fallback);
      setUserRole(fallback.role);
    }
    showToast(`Membre ${memberToDelete?.name || ''} retiré du CA.`);
  };

  // Logout handler (clears Supabase and local session)
  const handleLogout = async () => {
    await signOutSupabase();
    localStorage.removeItem('ffmc06_authenticated');
    setIsAuthenticated(false);
    setIsUserModalOpen(false);
    showToast('Déconnexion effectuée. À bientôt sur l’intranet FFMC 06 !');
  };

  // Guard member access: redirect away from coordinator-only tabs
  useEffect(() => {
    if (userRole === 'membre' && ['dashboard', 'inbox', 'meetings', 'cron', 'team'].includes(activeTab)) {
      setActiveTab('today');
    }
  }, [userRole, activeTab]);

  // Handlers for Tasks
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
    showToast(`Statut de l'action #${taskId} mis à jour : ${newStatus}`);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t))
    );
    showToast('Action mise à jour.');
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Confirmer la suppression de cette action ?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Action supprimée.');
    }
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: Task = {
      ...newTask,
      id: `tsk-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
    showToast(`Nouvelle action créée : "${created.title.slice(0, 35)}..."`);
  };

  // Handlers for Emails
  const handleUpdateEmail = (updated: EmailMessage) => {
    setEmails((prev) => {
      const exists = prev.some((e) => e.id === updated.id);
      if (exists) {
        return prev.map((e) => (e.id === updated.id ? updated : e));
      } else {
        return [updated, ...prev];
      }
    });
  };

  // Handlers for CA Shares
  const handleAddCAShare = (newShare: Omit<CAShare, 'id' | 'publishedAt'>) => {
    const created: CAShare = {
      ...newShare,
      id: `sha-${Date.now().toString().slice(-4)}`,
      publishedAt: new Date().toISOString(),
      readCount: 0,
    };
    setCaShares((prev) => [created, ...prev]);
    showToast(`Partage "${created.title.slice(0, 35)}..." publié pour le CA.`);
  };

  const handleUpdateCAShare = (updated: CAShare) => {
    setCaShares((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Publication CA mise à jour.');
  };

  const handleDeleteCAShare = (shareId: string) => {
    if (window.confirm('Confirmer la suppression de cette publication destinée au CA ?')) {
      setCaShares((prev) => prev.filter((s) => s.id !== shareId));
      showToast('Publication retirée.');
    }
  };

  const handlePrepareCAShareFromEmail = (shareData: {
    title: string;
    content: string;
    sourceTitle: string;
    sourceId: string;
  }) => {
    const newShare: CAShare = {
      id: `sha-${Date.now().toString().slice(-4)}`,
      title: shareData.title,
      content: shareData.content,
      category: 'courrier_valide',
      publishedAt: new Date().toISOString(),
      author: userRole === 'coordinateur' ? 'Antoine F. (Coordinateur)' : 'Membre du CA',
      authorRole: 'Coordinateur FFMC 06',
      status: 'active',
      sourceType: 'email',
      sourceId: shareData.sourceId,
      sourceTitle: shareData.sourceTitle,
      readCount: 0,
    };
    setCaShares((prev) => [newShare, ...prev]);
    setActiveTab('shares');
    showToast("Partage préparé avec succès et ouvert dans l'espace Partages au CA !");
  };

  // Handler for News
  const handleAddNews = (newItem: NewsItem) => {
    setNewsList((prev) => {
      if (prev.some((n) => n.hash === newItem.hash || n.title === newItem.title)) {
        return prev;
      }
      return [newItem, ...prev];
    });
  };

  const handleUpdateNews = (updated: NewsItem) => {
    setNewsList((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  // Handler for Meetings
  const handleAddMeeting = (m: Meeting) => {
    setMeetings((prev) => [m, ...prev]);
    showToast(`Réunion "${m.title}" ajoutée au calendrier.`);
  };

  const handleUpdateMeeting = (m: Meeting) => {
    setMeetings((prev) => prev.map((item) => (item.id === m.id ? m : item)));
  };

  // Handler for Cron
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerCronSync();
      if (res.log) {
        setCronLogs((prev) => [res.log, ...prev]);
      }
      if (res.config) {
        setCronConfig(res.config);
      }
      // Also fetch fresh news from live feeds
      const newsRes = await fetchLiveNewsRSS();
      if (newsRes && newsRes.items && newsRes.items.length > 0) {
        setNewsList(newsRes.items);
      }
      showToast(
        newsRes?.newCount && newsRes.newCount > 0
          ? `Relève effectuée : ${newsRes.newCount} nouvelle(s) info(s) ajoutée(s) !`
          : 'Relève effectuée : données synchronisées avec succès !'
      );
    } catch (e) {
      showToast('Erreur lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCronConfig = (partial: Partial<CronConfig>) => {
    setCronConfig((prev) => ({ ...prev, ...partial }));
    showToast('Configuration du cron mise à jour.');
  };

  // Urgent counts
  const urgentTasksCount = tasks.filter((t) => t.priority === 'p0' && t.status !== 'completed').length;
  const pendingEmailsCount = emails.filter((e) => e.replyStatus === 'pending' || e.replyStatus === 'drafted').length;
  const unreadNewsCount = newsList.filter((n) => n.impactLevel === 'fort').length;

  // Login Gate: if not authenticated, show Supabase login page at the start of the app
  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LoginPage
          caMembers={caMembers}
          onLoginSuccess={(member) => {
            setCurrentUser(member);
            setUserRole(member.role);
            setIsAuthenticated(true);
            localStorage.setItem('ffmc06_authenticated', 'true');
            showToast(`Bienvenue ${member.name} (${member.title}) !`);
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-red-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-900 border border-red-500/50 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cronConfig={cronConfig}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        urgentTasksCount={urgentTasksCount}
        pendingEmailsCount={pendingEmailsCount}
        unreadNewsCount={unreadNewsCount}
        activeSharesCount={caShares.length}
        userRole={userRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenConnections={() => setIsConnectionsOpen(true)}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Access Restricted Screen for CA Members trying to access Coordinator tools */}
        {userRole === 'membre' && ['dashboard', 'inbox', 'meetings', 'team', 'cron'].includes(activeTab) && (
          <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Espace réservé au Coordinateur Général
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Accès restreint · Niveau d'habilitation : Coordinateur
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-md mx-auto">
              Cette section contient des données de gestion interne et de correspondance réservées à l'administration du bureau. En tant que <strong>Membre du Conseil d'Administration</strong>, vous avez accès à l'espace <strong>Partages du CA</strong>, à la <strong>Synthèse quotidienne</strong> et à la <strong>Veille d'actualités</strong>.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => setActiveTab('shares')}
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs shadow-md transition"
              >
                Accéder aux Partages du CA
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Voir le Briefing du jour
              </button>
            </div>
          </div>
        )}

        {activeTab === 'today' && (
          <TodayMorningBrief
            tasks={tasks}
            emails={emails}
            newsList={newsList}
            onNavigateTab={setActiveTab}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onViewTaskSource={(task) => setActiveModalTask(task)}
            onOpenEmail={(email) => {
              setActiveEmailDetail(email);
              setActiveTab('inbox');
            }}
          />
        )}

        {activeTab === 'dashboard' && userRole === 'coordinateur' && (
          <Dashboard
            tasks={tasks}
            emails={emails}
            newsList={newsList}
            meetings={meetings}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onNavigateTab={setActiveTab}
            onOpenEmail={(email) => {
              setActiveEmailDetail(email);
              setActiveTab('inbox');
            }}
          />
        )}

        {activeTab === 'inbox' && userRole === 'coordinateur' && (
          <GmailInbox
            emails={emails}
            onUpdateEmail={handleUpdateEmail}
            onAddTask={handleAddTask}
            onPrepareCAShare={handlePrepareCAShareFromEmail}
            selectedEmailId={activeEmailDetail?.id}
          />
        )}

        {activeTab === 'meetings' && userRole === 'coordinateur' && (
          <MeetingsManager
            meetings={meetings}
            tasks={tasks}
            onAddMeeting={handleAddMeeting}
            onUpdateMeeting={handleUpdateMeeting}
            onAddTask={handleAddTask}
            onViewTaskSource={(task) => setActiveModalTask(task)}
          />
        )}

        {activeTab === 'shares' && (
          <CASharesManager
            shares={caShares}
            userRole={userRole}
            onAddShare={handleAddCAShare}
            onUpdateShare={handleUpdateCAShare}
            onDeleteShare={handleDeleteCAShare}
          />
        )}

        {activeTab === 'team' && userRole === 'coordinateur' && (
          <CAMembersManager
            caMembers={caMembers}
            currentUser={currentUser}
            onSelectUser={handleSelectUser}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'news' && (
          <NewsBoard
            newsList={newsList}
            onAddNews={handleAddNews}
            onUpdateNews={handleUpdateNews}
            onAddTask={handleAddTask}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'cron' && userRole === 'coordinateur' && (
          <AutomationCron
            cronConfig={cronConfig}
            cronLogs={cronLogs}
            onUpdateConfig={handleUpdateCronConfig}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Global Task Traceability Modal */}
      {activeModalTask && (
        <SourceTraceabilityModal
          task={activeModalTask}
          onClose={() => setActiveModalTask(null)}
          emails={emails}
          meetings={meetings}
          newsList={newsList}
          onNavigateToSource={(type, id) => {
            if (type === 'email') setActiveTab('inbox');
            if (type === 'meeting') setActiveTab('meetings');
            if (type === 'news') setActiveTab('news');
          }}
        />
      )}

      {/* Connections & Live Data Modal */}
      <ConnectionsModal
        isOpen={isConnectionsOpen}
        onClose={() => setIsConnectionsOpen(false)}
        onRefreshData={handleTriggerSync}
      />

      {/* User Switcher, Login & CA Members Modal */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        caMembers={caMembers}
        onSelectUser={handleSelectUser}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 text-center text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              FFMC 06 · Fédération Française des Motards en Colère des Alpes-Maritimes
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
            Intranet du Conseil d'Administration FFMC 06 • Accès sécurisé interne • Confidentialité des débats
          </span>
        </div>
      </footer>
    </div>
  );
}
