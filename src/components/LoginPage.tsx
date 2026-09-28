import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Key,
  ArrowRight,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown,
  ExternalLink,
  Settings,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CAMember } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseKeyLocally,
  getSupabaseClient,
  signInWithSupabaseEmailPassword,
  signInWithSupabaseMagicLink,
  testSupabaseConnection,
} from '../services/supabaseService';

interface LoginPageProps {
  caMembers: CAMember[];
  onLoginSuccess: (member: CAMember) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ caMembers, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'supabase' | 'direct' | 'quick'>('supabase');
  const [supabaseSubMode, setSupabaseSubMode] = useState<'password' | 'magic_link'>('password');

  // Supabase credentials
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Direct CA Member password form
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');

  // Supabase Key Configuration Drawer
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [keySaveFeedback, setKeySaveFeedback] = useState<string | null>(null);

  const supabaseConfig = getSupabaseConfig();
  const hasSupabaseKey = Boolean(supabaseConfig.key);

  useEffect(() => {
    if (supabaseConfig.key) {
      setSupabaseKeyInput(supabaseConfig.key);
    }
  }, [supabaseConfig.key]);

  // Match email to an existing CA member or create on-the-fly
  const resolveMemberFromEmail = (email: string): CAMember => {
    const cleanEmail = email.trim().toLowerCase();
    const matched = caMembers.find(
      (m) => m.email.toLowerCase() === cleanEmail || m.name.toLowerCase() === cleanEmail
    );
    if (matched) return matched;

    // Check if it's the known coordinator email
    const isCoord = cleanEmail.includes('coordinateur') || cleanEmail === 'compteepicgamesantoine@gmail.com';
    return {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || 'Membre CA',
      email: cleanEmail,
      role: isCoord ? 'coordinateur' : 'membre',
      title: isCoord ? 'Coordinateur Général FFMC 06' : 'Membre du CA',
      avatarColor: isCoord ? 'bg-red-700 text-white' : 'bg-slate-700 text-white',
    };
  };

  // 1. Supabase Auth Handler
  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabaseEmail.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!hasSupabaseKey) {
      setShowKeyConfig(true);
      setErrorMessage(
        'Veuillez d\'abord renseigner la clé API Supabase (anon) ci-dessous ou utiliser le mode Direct.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (supabaseSubMode === 'password') {
        if (!supabasePassword) {
          throw new Error('Veuillez saisir votre mot de passe Supabase.');
        }

        const { data, error } = await signInWithSupabaseEmailPassword(
          supabaseEmail.trim(),
          supabasePassword
        );

        if (error) {
          // If auth fails, check if the member exists in local CA list with this password
          const matched = caMembers.find(
            (m) =>
              m.email.toLowerCase() === supabaseEmail.trim().toLowerCase() &&
              m.password === supabasePassword.trim()
          );
          if (matched) {
            setSuccessMessage(`Authentification réussie pour ${matched.name} !`);
            setTimeout(() => onLoginSuccess(matched), 600);
            return;
          }
          throw error;
        }

        const authenticatedUser = data.user;
        const member = resolveMemberFromEmail(authenticatedUser?.email || supabaseEmail);
        setSuccessMessage(`Connexion Supabase réussie ! Bienvenue ${member.name}.`);
        setTimeout(() => onLoginSuccess(member), 600);
      } else {
        // Magic Link
        const { error } = await signInWithSupabaseMagicLink(supabaseEmail.trim());
        if (error) throw error;
        setSuccessMessage(
          `Un lien magique a été envoyé à ${supabaseEmail}. Cliquez dessus depuis votre messagerie pour vous connecter.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la connexion Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Direct CA Member Password Login
  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const query = directEmail.trim().toLowerCase();
    const matched = caMembers.find(
      (m) => m.email.toLowerCase() === query || m.name.toLowerCase() === query
    );

    if (!matched) {
      setErrorMessage('Aucun membre du CA ne correspond à cet email ou nom.');
      return;
    }

    if (matched.password && matched.password !== directPassword.trim()) {
      setErrorMessage('Mot de passe incorrect pour ce membre.');
      return;
    }

    setSuccessMessage(`Connexion validée pour ${matched.name} (${matched.title}) !`);
    setTimeout(() => onLoginSuccess(matched), 500);
  };

  // 3. Save Supabase API Key
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeySaveFeedback(null);
    if (!supabaseKeyInput.trim()) return;

    saveSupabaseKeyLocally(supabaseKeyInput.trim());
    const test = await testSupabaseConnection(supabaseKeyInput.trim());
    if (test.success) {
      setKeySaveFeedback('Clé Supabase enregistrée et vérifiée avec succès !');
      setTimeout(() => setShowKeyConfig(false), 1200);
    } else {
      setKeySaveFeedback(`Enregistrée, mais attention : ${test.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-red-600 selection:text-white">
      {/* Top Bar / Branding */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-lg shadow-md border border-red-500/30">
            06
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              <span>FFMC 06</span>
              <span className="text-red-500 text-xs font-normal">|</span>
              <span className="text-slate-300 font-semibold text-xs sm:text-sm">Espace CA Intranet</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Fédération Française des Motards en Colère · Alpes-Maritimes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                hasSupabaseKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-[10px]">
              {hasSupabaseKey ? 'Supabase Actif' : 'Mode Autonome'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-lg mx-auto w-full my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Card Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-inner mb-1">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Connexion Conseil d'Administration
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Accédez aux synthèses de veille, à la boîte Gmail, aux réunions et aux dossiers partagés de la FFMC 06.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthMode('supabase');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'supabase'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('direct');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'direct'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Mot de passe</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('quick');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'quick'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Accès Démo</span>
            </button>
          </div>

          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SUPABASE AUTH */}
          {authMode === 'supabase' && (
            <form onSubmit={handleSupabaseSubmit} className="space-y-4">
              {/* Sub-modes: Password vs Magic Link */}
              <div className="flex items-center justify-center gap-3 text-xs border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setSupabaseSubMode('password')}
                  className={`font-semibold pb-1 border-b-2 transition ${
                    supabaseSubMode === 'password'
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Email + Mot de passe
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => setSupabaseSubMode('magic_link')}
                  className={`font-semibold pb-1 border-b-2 transition ${
                    supabaseSubMode === 'magic_link'
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Lien magique par Email
                </button>
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Adresse email du membre :
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="coordinateur.ffmc06@gmail.com ou votre.email@ffmc.fr"
                    value={supabaseEmail}
                    onChange={(e) => setSupabaseEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password field (if password mode) */}
              {supabaseSubMode === 'password' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Mot de passe :
                    </label>
                    <span className="text-[10px] text-slate-500">
                      (Supabase ou mot de passe attribué)
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={supabasePassword}
                      onChange={(e) => setSupabasePassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authentification Supabase en cours...</span>
                ) : supabaseSubMode === 'password' ? (
                  <>
                    <span>Se connecter via Supabase</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer le lien de connexion magique</span>
                  </>
                )}
              </button>

              {/* Supabase Instance configuration toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
                >
                  <Settings className="w-3 h-3" />
                  <span>
                    {hasSupabaseKey ? 'Modifier la clé API Supabase' : '⚙️ Configurer la clé API Supabase'}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transform transition-transform ${
                      showKeyConfig ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Expandable Key Form */}
              {showKeyConfig && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-left animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-red-500" />
                      Clé Publique Anon Supabase
                    </span>
                    <a
                      href="https://supabase.com/dashboard/project/hojiveehwtazeqiymnwg/settings/api"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Dashboard Supabase</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Collez ici la clé publique <code>anon</code> / <code>publishable</code> de votre projet Supabase (<code>{supabaseConfig.url}</code>).
                  </p>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {keySaveFeedback && (
                    <div className="text-[11px] text-emerald-400">{keySaveFeedback}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
                  >
                    Enregistrer la clé locale
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: DIRECT CA MEMBER PASSWORD */}
          {authMode === 'direct' && (
            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Connexion directe réservée aux bénévoles avec le mot de passe attribué par le Coordinateur.
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Email ou Prénom du bénévole :
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean-Marc ou voirie.ffmc06@gmail.com"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Mot de passe :
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50"
              >
                <span>Valider et entrer sur l'Intranet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: QUICK DEMO ACCESS */}
          {authMode === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Basculez instantanément pour tester les différents profils et permissions du Conseil d'Administration :
              </p>

              <div className="space-y-2">
                {caMembers.map((member) => {
                  const isCoord = member.role === 'coordinateur';
                  return (
                    <button
                      key={member.id}
                      onClick={() => onLoginSuccess(member)}
                      className="w-full p-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/70 hover:bg-slate-950 text-left flex items-center justify-between gap-3 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            member.avatarColor || 'bg-slate-700 text-white'
                          }`}
                        >
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-red-400 transition flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isCoord && <span className="text-[10px]">👑</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">{member.title}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCoord
                            ? 'bg-red-950 text-red-400 border border-red-900'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isCoord ? 'Coordinateur' : 'Membre CA'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 border-t border-slate-800/80 text-xs text-slate-500">
        <p>
          Fédération Française des Motards en Colère (FFMC 06) • Espace Interne Sécurisé du Bureau & CA
        </p>
      </footer>
    </div>
  );
};
