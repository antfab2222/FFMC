import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CloudSun,
  Rss,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key,
  Radio,
  Lock,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseKeyLocally,
  removeSupabaseKeyLocally,
  testSupabaseConnection,
  getGmailAuthUrl,
} from '../services/supabaseService';

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [supabaseConfig, setSupabaseConfig] = useState<{ url: string; key: string }>({ url: '', key: '' });
  const [inputKey, setInputKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setSupabaseConfig(cfg);
      setInputKey(cfg.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(inputKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveSupabaseKeyLocally(inputKey);
    setSupabaseConfig(getSupabaseConfig());
    if (onRefreshData) onRefreshData();
  };

  const handleClear = () => {
    removeSupabaseKeyLocally();
    setInputKey('');
    setSupabaseConfig(getSupabaseConfig());
    setTestResult(null);
    if (onRefreshData) onRefreshData();
  };

  const gmailAuthUrl = getGmailAuthUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Centre des Connexions & Données Directes
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                État des flux temps réel, de la base Supabase et de la boîte Gmail
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

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* 1. Météo Cols 06 */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CloudSun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Météo & Praticabilité des Cols du 06 (Open-Meteo)
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                100% Connecté en direct
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Relevé en direct des 5 cols majeurs des Alpes-Maritimes : <strong>Turini (1604m)</strong>, <strong>Bonette (2802m)</strong>, <strong>Braus</strong>, <strong>Vence</strong> et <strong>Castillon</strong>. Températures réelles, rafales de vent et détection de verglas.
            </p>
          </div>

          {/* 2. Flux RSS FFMC & Motomag */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Rss className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Veille Réglementaire & Actualités Officielles
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Flux officiels actifs
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Agrégation des flux RSS officiels de la <strong>FFMC Nationale</strong> (<code>ffmc.asso.fr</code>) et de <strong>Moto Magazine</strong> (<code>motomag.com</code>) avec filtrage des doublons.
            </p>
          </div>

          {/* 3. Base Supabase Partagée */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Base de Données Partagée CA (Supabase)
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  supabaseConfig.key
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {supabaseConfig.key ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Clé configurée
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    En attente de clé
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
              <div>
                Instance : <code className="font-mono text-slate-800 dark:text-zinc-200">{supabaseConfig.url}</code>
              </div>
              <p>
                Permet à tous les membres du CA d’avoir la même liste de dossiers, d'actions et de partages synchronisée en temps réel.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Clé publique Supabase (<code>anon</code> / <code>publishable</code>) :
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Coller la clé (sb_publishable_... ou eyJ...)"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <button
                  onClick={handleTest}
                  disabled={isTesting || !inputKey}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  Tester
                </button>
                <button
                  onClick={handleSave}
                  disabled={!inputKey}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white transition disabled:opacity-50"
                >
                  Sauvegarder
                </button>
                {supabaseConfig.key && (
                  <button
                    onClick={handleClear}
                    className="px-2 py-2 text-xs text-slate-400 hover:text-red-600 transition"
                    title="Effacer la clé"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Connexion Boîte Gmail Coordinateur */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Relève Gmail du Coordinateur (<code>coordinateur.ffmc06@gmail.com</code>)
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                OAuth Sécurisé
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Pour importer automatiquement les mails reçus par la FFMC 06, la liaison utilise l’Edge Function sécurisée Supabase <code>gmail-connect</code>. Seule l'adresse officielle <strong>coordinateur.ffmc06@gmail.com</strong> est autorisée.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Lecture seule stricte &bull; Jamais d’envoi automatique non approuvé
              </div>
              <a
                href={gmailAuthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition shadow-xs"
              >
                Autoriser l’accès Gmail
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 flex justify-end">
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
