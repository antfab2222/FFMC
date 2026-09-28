import { MailCategory } from './mail-taxonomy';

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type TaskSourceType = 'email' | 'meeting' | 'news' | 'manual';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  sourceType: TaskSourceType;
  sourceId?: string;
  sourceTitle?: string;
  sourceSnippet?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type MeetingType = 'bureau' | 'ag' | 'commission_voirie' | 'reunion_partenaires' | 'preparation_manif';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DDTHH:mm
  location: string;
  status: MeetingStatus;
  attendees: string[];
  agenda: string[];
  summary?: string;
  extractedTaskIds?: string[];
  documentUrl?: string;
}

export type UserRole = 'coordinateur' | 'membre';

export interface CAMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarColor?: string;
  phone?: string;
}

export interface CAShare {
  id: string;
  title: string;
  content: string;
  category: 'note_de_synthese' | 'courrier_valide' | 'decision_reunion' | 'communique';
  publishedAt: string;
  author: string;
  authorRole?: string;
  status: 'active' | 'archived';
  sourceType?: 'email' | 'meeting' | 'news' | 'manual';
  sourceId?: string;
  sourceTitle?: string;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
  readCount?: number;
}

export type NewsSource =
  | 'Légifrance'
  | 'Sécurité Routière'
  | 'Métropole Nice Côte d’Azur'
  | 'FFMC Nationale'
  | 'Motomag'
  | 'DDTM 06';

export type NewsCategory = 'reglementation' | 'infrastructure_06' | 'manif' | 'securite_routiere' | 'juridique';
export type NewsGeographicalScope = 'Europe' | 'France' | 'Région Sud' | '06 - Alpes-Maritimes';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: NewsSource;
  sourceUrl: string;
  category: NewsCategory;
  geographicalScope: NewsGeographicalScope;
  announcementType: 'Législation' | 'Arrêté préfectoral / métropolitain' | 'Mobilisation & Manif' | 'Infrastructure & Sécurité' | 'Recherche & Baromètre';
  impactLevel: 'fort' | 'moyen' | 'faible';
  publishedAt: string;
  searchDate: string;
  hash: string;
  keyPoints: string[];
  bookmarked?: boolean;
  linkedTaskId?: string;
}

export interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  category: MailCategory;
  priority: TaskPriority;
  impactAnalysis: string;
  suggestedReply?: string;
  replyStatus: 'pending' | 'drafted' | 'approved' | 'sent';
  isRead: boolean;
  tasksExtracted?: Array<{
    title: string;
    assignee: string;
    dueDate: string;
    priority: TaskPriority;
    taskId?: string;
  }>;
}

export interface CronLog {
  id: string;
  timestamp: string;
  source: 'gmail' | 'rss' | 'system';
  status: 'success' | 'warning' | 'error';
  message: string;
  itemsProcessed: number;
  tasksCreated: number;
  durationMs: number;
}

export interface CronConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  isRunning: boolean;
  autoExtractTasks: boolean;
  gmailActive: boolean;
  rssActive: boolean;
}

export interface MorningBriefing {
  date: string;
  summary: string;
  urgenciesCount: number;
  dueTasksCount: number;
  keyNewsHighlights: string[];
  weatherMountainPasses: Array<{
    col: string;
    altitude: string;
    status: 'Ouvert' | 'Fermé' | 'Délicat' | 'Travaux';
    details: string;
  }>;
}
