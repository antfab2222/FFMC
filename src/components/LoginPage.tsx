import React, { useState } from "react";
import type { CAMember } from "../types";
import {
  signInWithSupabaseEmailPassword,
  sendSupabaseOtpCode,
  verifySupabaseOtpCode,
  signOutSupabase,
} from "../services/supabaseService";
import { authenticatedMember } from "../services/backendService";
export function LoginPage({
  onLoginSuccess,
}: {
  caMembers: CAMember[];
  onLoginSuccess: (member: CAMember) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "code">("password");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result =
        mode === "password"
          ? await signInWithSupabaseEmailPassword(email.trim(), password)
          : await verifySupabaseOtpCode(email.trim(), password.trim());
      if (result.error) throw result.error;
      const member = await authenticatedMember();
      if (!member) throw new Error("Connexion non validée.");
      onLoginSuccess(member);
    } catch (e: any) {
      await signOutSupabase();
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function sendCode() {
    setBusy(true);
    setMessage("");
    try {
      const r = await sendSupabaseOtpCode(email.trim());
      if (r.error) throw r.error;
      setMode("code");
      setPassword("");
      setMessage("Consultez le code ou le lien reçu par email.");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-950 p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 dark:text-white border border-slate-200 dark:border-zinc-800 p-8 space-y-5"
      >
        <h1 className="text-2xl font-bold">FFMC 06 · Espace CA</h1>
        <p className="text-sm text-slate-500">
          Connectez-vous avec votre compte autorisé.
        </p>
        <label className="block text-sm">
          Adresse email
          <input
            className="mt-2 w-full border rounded-lg p-3 bg-transparent"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          {mode === "password" ? "Mot de passe" : "Code reçu par email"}
          <input
            className="mt-2 w-full border rounded-lg p-3 bg-transparent"
            type={mode === "password" ? "password" : "text"}
            autoComplete={
              mode === "password" ? "current-password" : "one-time-code"
            }
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {message && (
          <p role="alert" className="text-sm text-amber-700">
            {message}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full p-3 bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <button
          type="button"
          disabled={busy || !email}
          className="text-sm underline"
          onClick={sendCode}
        >
          Recevoir un code par email
        </button>
        {mode === "code" && (
          <button
            className="block text-sm underline"
            type="button"
            onClick={() => {
              setMode("password");
              setPassword("");
            }}
          >
            Utiliser mon mot de passe
          </button>
        )}
      </form>
    </main>
  );
}
