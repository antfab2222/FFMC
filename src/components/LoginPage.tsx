import React, { useState, useEffect } from 'react';
import {
  Shield,
  Mail,
  Key,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { CAMember } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseKeyLocally,
  sendSupabaseOtpCode,
  verifySupabaseOtpCode,
  signInWithSupabaseEmailPassword,
  testSupabaseConnection,
} from '../services/supabaseService';

interface LoginPageProps {
  caMembers: CAMember[];
  onLoginSuccess: (member: CAMember) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ caMembers, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Supabase Key config drawer
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

  // Resolve member profile from email
  const resolveMemberFromEmail = (cleanEmail: string): CAMember => {
    const query = cleanEmail.trim().toLowerCase();
    const matched = caMembers.find(
      (m) => m.email.toLowerCase() === query || m.name.toLowerCase() === query
    );
    if (matched) return matched;

    const isCoord = query.includes('coordinateur') || query === 'compteepicgamesantoine@gmail.com';
    return {
      id: `usr-${Date.now()}`,
      name: cleanEmail.split('@')[0] || 'Membre CA',
      email: cleanEmail,
      role: isCoord ? 'coordinateur' : 'membre',
      title: isCoord ? 'Coordinateur Général FFMC 06' : 'Membre du CA',
      avatarColor: isCoord ? 'bg-red-700 text-white' : 'bg-slate-700 text-white',
    };
  };

  // 1. Send OTP code by email (Supabase)
  const handleSendCodeByEmail = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Veuillez saisir votre adresse email d\'abord.');
      return;
    }

    if (!hasSupabaseKey) {
      setShowKeyConfig(true);
      setErrorMessage(
        'Pour envoyer un code par email via Supabase, veuillez renseigner la clé anon ci-dessous ou utiliser votre code/mot de passe de bénévole.'
      );
      return;
    }

    setIsSendingCode(true);
    try {
      const { error } = await sendSupabaseOtpCode(cleanEmail);
      if (error) throw error;
      setCodeSent(true);
      setSuccessMessage(
        `Code de sécurité envoyé avec succès à ${cleanEmail} ! Consultez votre boîte de réception.`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 2. Validate Email + Code
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!cleanCode) {
      setErrorMessage('Veuillez renseigner votre code ou mot de passe de connexion.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Check if code matches a CA Member's assigned password/code
      const localMatched = caMembers.find(
        (m) =>
          (m.email.toLowerCase() === cleanEmail || m.name.toLowerCase() === cleanEmail) &&
          m.password &&
          m.password.trim() === cleanCode
      );

      if (localMatched) {
        setSuccessMessage(`Connexion réussie ! Bienvenue ${localMatched.name}.`);
        setTimeout(() => onLoginSuccess(localMatched), 500);
        return;
      }

      // Step B: If Supabase key is present, verify via Supabase Auth
      if (hasSupabaseKey) {
        // If 6-digit numeric token, try verifyOtp
        const isNumericToken = /^\d{6}$/.test(cleanCode);
        if (isNumericToken) {
          const { data, error } = await verifySupabaseOtpCode(cleanEmail, cleanCode);
          if (!error && data?.user) {
            const member = resolveMemberFromEmail(data.user.email || cleanEmail);
            setSuccessMessage(`Code validé ! Bienvenue ${member.name}.`);
            setTimeout(() => onLoginSuccess(member), 500);
            return;
          }
        }

        // Try password auth
        const { data: pwdData, error: pwdError } = await signInWithSupabaseEmailPassword(
          cleanEmail,
          cleanCode
        );

        if (!pwdError && pwdData?.user) {
          const member = resolveMemberFromEmail(pwdData.user.email || cleanEmail);
          setSuccessMessage(`Connexion validée ! Bienvenue ${member.name}.`);
          setTimeout(() => onLoginSuccess(member), 500);
          return;
        }

        // If neither worked and error exists
        if (pwdError) {
          throw new Error('Code de sécurité ou mot de passe incorrect.');
        }
      }

      // Step C: Fallback check if user exists but code is wrong
      const existingMember = caMembers.find(
        (m) => m.email.toLowerCase() === cleanEmail || m.name.toLowerCase() === cleanEmail
      );
      if (existingMember) {
        throw new Error('Code d\'accès incorrect pour cette adresse.');
      } else {
        throw new Error('Adresse email non reconnue dans l\'équipe du CA.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Identifiants invalides.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Save Supabase Anon Key if needed
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
              <span className="text-slate-300 font-semibold text-xs sm:text-sm">Intranet du CA</span>
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
                hasSupabaseKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <span className="font-mono text-[10px]">Accès Sécurisé</span>
          </div>
        </div>
      </header>

      {/* Main Single-Method Login Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-inner mb-1">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Connexion Conseil d'Administration
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Identifiez-vous à l'aide de votre adresse email et de votre code de sécurité.
            </p>
          </div>

          {/* Feedback Alerts */}
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

          {/* Unique Login Form (Email + Code) */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Adresse Email du membre :
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="coordinateur.ffmc06@gmail.com ou votre email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Field 2: Code / Mot de passe */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Code d'accès / Mot de passe :
                </label>

                {/* Send OTP code button */}
                <button
                  type="button"
                  onClick={handleSendCodeByEmail}
                  disabled={isSendingCode}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  title="Recevoir un code de sécurité à 6 chiffres par email"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingCode ? 'Envoi...' : codeSent ? 'Renvoyer code' : 'Recevoir code par email'}</span>
                </button>
              </div>

              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCode ? 'text' : 'password'}
                  required
                  placeholder={codeSent ? 'Entrez le code à 6 chiffres reçu' : 'Code ou mot de passe attribué'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/80 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification du code...</span>
                </>
              ) : (
                <>
                  <span>Accéder à l'Intranet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help Accordion for Coordinators / Keys */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
            >
              <Settings className="w-3 h-3" />
              <span>Paramètres de sécurité Supabase</span>
              <ChevronDown
                className={`w-3 h-3 transform transition-transform ${
                  showKeyConfig ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Key Form */}
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
                  <span>Dashboard</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Permet l'envoi de codes OTP et l'authentification directe sur <code>{supabaseConfig.url}</code>.
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
                Enregistrer la clé
              </button>
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
