import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  Terminal,
  Server,
  Zap,
} from 'lucide-react';
import { CronConfig, CronLog } from '../types';

interface AutomationCronProps {
  cronConfig: CronConfig;
  cronLogs: CronLog[];
  onUpdateConfig: (config: Partial<CronConfig>) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const AutomationCron: React.FC<AutomationCronProps> = ({
  cronConfig,
  cronLogs,
  onUpdateConfig,
  onTriggerSync,
  isSyncing,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const githubActionsYaml = `name: Relève Périodique Gmail & RSS FFMC 06

on:
  schedule:
    # Exécution toutes les 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  poll-and-analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Déclencher Edge Function Relève Email
        run: |
          curl -X POST "\${{ secrets.SUPABASE_URL }}/functions/v1/mail-assistant" \\
            -H "Authorization: Bearer \${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \\
            -H "Content-Type: application/json"
`;

  const supabasePgCronSql = `-- Extension pg_cron sur Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Planification de la relève automatique toutes les 15 minutes
SELECT cron.schedule(
  'releve-emails-ffmc06',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/mail-assistant',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{"trigger": "pg_cron"}'::jsonb
  );
  $$
);`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Automatisation & Planificateur Cron (Relève en tâche de fond)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Orchestration de la relève Gmail, analyse Gemini, extraction des tâches et scraping RSS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateConfig({ enabled: !cronConfig.enabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              cronConfig.enabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {cronConfig.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{cronConfig.enabled ? 'Cron Actif (En marche)' : 'Cron en Pause'}</span>
          </button>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Exécution...' : 'Forcer la relève'}</span>
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Fréquence de scrutation</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Toutes les {cronConfig.intervalMinutes} min
            </span>
            <select
              value={cronConfig.intervalMinutes}
              onChange={(e) => onUpdateConfig({ intervalMinutes: Number(e.target.value) })}
              className="px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 heure</option>
              <option value={360}>6 heures</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Dernière exécution</span>
          <div className="pt-1">
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-zinc-200">
              {cronConfig.lastRunAt
                ? new Date(cronConfig.lastRunAt).toLocaleTimeString('fr-FR')
                : 'Aucune'}
            </span>
            <span className="block text-[11px] text-slate-400 dark:text-zinc-500">
              {cronConfig.lastRunAt
                ? new Date(cronConfig.lastRunAt).toLocaleDateString('fr-FR')
                : ''}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Extraction automatique des tâches</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {cronConfig.autoExtractTasks ? 'Activée (IA)' : 'Désactivée'}
            </span>
            <button
              onClick={() => onUpdateConfig({ autoExtractTasks: !cronConfig.autoExtractTasks })}
              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
                cronConfig.autoExtractTasks ? 'bg-red-600 justify-end' : 'bg-slate-300 dark:bg-zinc-700 justify-start'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white block shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Execution Logs Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Journal d'exécution de la relève automatique ({cronLogs.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Zéro perte de données • Traçabilité RLS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-950/40 text-slate-500 dark:text-zinc-400 font-semibold uppercase">
                <th className="py-2.5 px-4">Horodatage</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-4">Détails du traitement</th>
                <th className="py-2.5 px-3">Éléments</th>
                <th className="py-2.5 px-3">Tâches créées</th>
                <th className="py-2.5 px-3">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono">
              {cronLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition">
                  <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-slate-700 dark:text-zinc-300 font-bold">{log.source}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800/50">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 dark:text-zinc-200 font-sans">{log.message}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{log.itemsProcessed}</td>
                  <td className="py-2.5 px-3 text-red-600 dark:text-red-400 font-bold">+{log.tasksCreated}</td>
                  <td className="py-2.5 px-3 text-slate-400 dark:text-zinc-500">{log.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Deployment Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Actions Snippet */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">GitHub Actions Cron (.github/workflows)</h4>
            </div>
            <button
              onClick={() => copyToClipboard(githubActionsYaml, 'gh')}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
              title="Copier le fichier YAML"
            >
              {copiedSnippet === 'gh' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-300 font-mono overflow-x-auto">
            {githubActionsYaml}
          </pre>
        </div>

        {/* Supabase pg_cron Snippet */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Supabase pg_cron (SQL Trigger)</h4>
            </div>
            <button
              onClick={() => copyToClipboard(supabasePgCronSql, 'sql')}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
              title="Copier le script SQL"
            >
              {copiedSnippet === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] text-slate-700 dark:text-zinc-300 font-mono overflow-x-auto">
            {supabasePgCronSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
