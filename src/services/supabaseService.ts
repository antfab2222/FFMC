// Client et service Supabase pour l'intranet FFMC 06
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hojiveehwtazeqiymnwg.supabase.co';

export interface SupabaseConfigState {
  url: string;
  key: string;
  isConnected: boolean;
  userEmail?: string;
  errorMessage?: string;
}

// Get saved key or env
export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem('ffmc_supabase_key') : null) || '';

  const url = envUrl || DEFAULT_SUPABASE_URL;
  const key = storedKey || (envKey.includes('REPLACE_ME') ? '' : envKey);

  return { url, key };
}

export function resetSupabaseClient() {
  clientInstance = null;
}

export function saveSupabaseKeyLocally(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ffmc_supabase_key', key.trim());
    clientInstance = null;
  }
}

export function removeSupabaseKeyLocally() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ffmc_supabase_key');
    clientInstance = null;
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  if (!clientInstance) {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
}

export async function signInWithSupabaseEmailPassword(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase n\'est pas encore configuré avec une clé API anon.');
  }
  return await client.auth.signInWithPassword({ email, password });
}

export async function signInWithSupabaseMagicLink(email: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase n\'est pas encore configuré avec une clé API anon.');
  }
  return await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname,
    },
  });
}

export async function signOutSupabase() {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => {});
  }
}

export async function getSupabaseSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function testSupabaseConnection(overrideKey?: string): Promise<{ success: boolean; message: string }> {
  const { url, key } = getSupabaseConfig();
  const testKey = overrideKey?.trim() || key;

  if (!testKey) {
    return {
      success: false,
      message: 'Aucune clé publique Supabase renseignée.',
    };
  }

  try {
    const tempClient = createClient(url, testKey);
    // Ping public rest schema
    const { error } = await tempClient.from('ca_publications').select('count', { count: 'exact', head: true });
    
    // An RLS 401/403 or success indicates the key is recognized by Supabase
    if (error && error.message.includes('API key not found')) {
      return {
        success: false,
        message: 'Clé API Supabase invalide.',
      };
    }

    return {
      success: true,
      message: `Connexion réussie avec ${url}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Erreur de connexion à Supabase.',
    };
  }
}

/**
 * Lien vers l'Edge Function pour la connexion Gmail OAuth de coordinateur.ffmc06@gmail.com
 */
export function getGmailAuthUrl(): string {
  const { url } = getSupabaseConfig();
  return `${url}/functions/v1/gmail-connect`;
}
