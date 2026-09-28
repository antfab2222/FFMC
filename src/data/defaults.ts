import type { CronConfig, CAMember } from "../types";
export const DEFAULT_CRON_CONFIG: CronConfig = {
  enabled: false,
  intervalMinutes: 5,
  lastRunAt: null,
  nextRunAt: null,
  isRunning: false,
  autoExtractTasks: false,
  gmailActive: false,
  rssActive: false,
};
export const EMPTY_USER: CAMember = {
  id: "",
  name: "",
  email: "",
  role: "membre",
  title: "",
};
