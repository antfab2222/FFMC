import type {
  Task,
  EmailMessage,
  Meeting,
  NewsItem,
  CronConfig,
  CronLog,
  CAShare,
  CAMember,
} from "../types";
import { DEFAULT_CRON_CONFIG, EMPTY_USER } from "../data/defaults";
import { legacyDemoIds } from "../data/legacyDemoIds";
import { fetchNews, mailAction } from "./backendService";

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
export function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function cleanList<T extends { id: string; sourceId?: string }>(
  key: string,
): T[] {
  const rows = loadFromStorage<T[]>(key, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      !legacyDemoIds.has(row.id) &&
      !legacyDemoIds.has(row.sourceId || ""),
  );
}
export const getStoredTasks = () => cleanList<Task>("ffmc06_tasks_v1");
export const saveTasks = (x: Task[]) => saveToStorage("ffmc06_tasks_v1", x);
// Private mail and news are loaded after server authentication, never restored from a shared browser cache.
export const getStoredEmails = (): EmailMessage[] => [];
export const saveEmails = (_: EmailMessage[]) => {
  localStorage.removeItem("ffmc06_emails_v1");
};
export const getStoredNews = (): NewsItem[] => [];
export const saveNews = (_: NewsItem[]) => {
  localStorage.removeItem("ffmc06_news_v1");
};
export const getStoredMeetings = () => cleanList<Meeting>("ffmc06_meetings_v1");
export const saveMeetings = (x: Meeting[]) =>
  saveToStorage("ffmc06_meetings_v1", x);
export const getStoredCAShares = () =>
  cleanList<CAShare>("ffmc06_ca_shares_v1");
export const saveCAShares = (x: CAShare[]) =>
  saveToStorage("ffmc06_ca_shares_v1", x);
export const getStoredCAMembers = (): CAMember[] => [];
export const saveCAMembers = (_: CAMember[]) => {
  localStorage.removeItem("ffmc06_ca_members_v1");
};
export const getStoredCurrentUser = () => EMPTY_USER;
export const saveCurrentUser = (_: CAMember) => {
  localStorage.removeItem("ffmc06_current_user_v1");
};
export const getStoredCronConfig = () => DEFAULT_CRON_CONFIG;
export const saveCronConfig = (_: CronConfig) => {
  localStorage.removeItem("ffmc06_cron_config_v1");
};
export const getStoredCronLogs = (): CronLog[] => [];
export const saveCronLogs = (_: CronLog[]) => {
  localStorage.removeItem("ffmc06_cron_logs_v1");
};
export async function triggerCronSync() {
  const start = Date.now();
  const result = await mailAction("sync");
  return {
    ...result,
    log: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: "gmail" as const,
      status: "success" as const,
      message: `${result.imported} nouveau(x) mail(s) importé(s).${result.hasMore ? " Import à poursuivre." : ""}`,
      itemsProcessed: result.imported,
      tasksCreated: 0,
      durationMs: Date.now() - start,
    },
  };
}
export async function fetchLiveNewsRSS() {
  const items = await fetchNews();
  return { success: true, items, newCount: 0 };
}
