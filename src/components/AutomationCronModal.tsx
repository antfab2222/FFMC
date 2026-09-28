import React from "react";
import type { CronConfig, CronLog } from "../types";
export function AutomationCron({
  cronConfig,
  cronLogs,
  onUpdateConfig,
  onTriggerSync,
  isSyncing,
}: {
  cronConfig: CronConfig;
  cronLogs: CronLog[];
  onUpdateConfig: (config: Partial<CronConfig>) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}) {
  return (
    <section className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-5">
      <h2 className="font-bold">Relève et analyse automatiques</h2>
      <p>
        Relève Gmail : toutes les 5 minutes lorsque l’automatisation est
        activée. Analyse Gemini : par lots de 3, dans la limite de 20 appels par
        jour.
      </p>
      <p className="text-sm text-slate-500">
        Le classement est enregistré sur le serveur. Les propositions restent à
        relire. Les actions à créer sont à valider séparément.
      </p>
      <p>
        Dernier import :{" "}
        {cronConfig.lastRunAt
          ? new Date(cronConfig.lastRunAt).toLocaleString("fr-FR")
          : "non disponible"}
      </p>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg"
          disabled={!cronConfig.gmailActive}
          onClick={() => onUpdateConfig({ enabled: !cronConfig.enabled })}
        >
          {cronConfig.enabled
            ? "Suspendre la relève automatique"
            : "Activer la relève automatique"}
        </button>
        <button
          className="px-4 py-2 bg-red-700 text-white rounded-lg disabled:opacity-50"
          disabled={isSyncing || !cronConfig.gmailActive}
          onClick={onTriggerSync}
        >
          {isSyncing ? "Relève…" : "Relever maintenant"}
        </button>
      </div>
      <h3 className="font-semibold">
        Opérations effectuées pendant cette session
      </h3>
      {!cronLogs.length && (
        <p className="text-sm text-slate-500">
          Aucune relève manuelle effectuée.
        </p>
      )}
      {cronLogs.map((l) => (
        <p key={l.id} className="text-sm">
          {new Date(l.timestamp).toLocaleString("fr-FR")} — {l.message}
        </p>
      ))}
    </section>
  );
}
