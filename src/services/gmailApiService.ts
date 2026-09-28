// Service officiel Gmail API pour l'intranet FFMC 06
import { EmailMessage, MailCategory, TaskPriority } from '../types';
import { analyzeEmailWithAI } from './api';

export interface GmailRawHeader {
  name: string;
  value: string;
}

export interface GmailRawMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload?: {
    headers: GmailRawHeader[];
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: any[];
    }>;
  };
}

// Decode base64url encoded string
function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

// Extract body from Gmail payload parts recursively
function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    // Prefer text/plain
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return decodeBase64Url(plainPart.body.data);
    }
    // Then text/html cleaned
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    }
    // Sub-parts
    for (const part of payload.parts) {
      const sub = extractBodyFromPayload(part);
      if (sub) return sub;
    }
  }

  return '';
}

/**
 * List messages from Gmail Inbox
 */
export async function listGmailMessages(
  accessToken: string,
  maxResults = 25
): Promise<{ id: string; threadId: string }[]> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur Gmail API (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.messages || [];
}

/**
 * Fetch detail of a single Gmail message
 */
export async function getGmailMessageDetail(
  accessToken: string,
  messageId: string
): Promise<GmailRawMessage> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Impossible de récupérer le message ${messageId}`);
  }

  return await response.json();
}

/**
 * Move unwanted email or spam to Gmail Trash
 */
export async function trashGmailMessage(
  accessToken: string,
  messageId: string
): Promise<boolean> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.ok;
}

/**
 * Synchronize and process real inbox messages:
 * 1. Fetch raw messages
 * 2. Filter out obvious spam / advertisements
 * 3. Run Gemini AI analysis on meaningful emails
 * 4. Generate summary, draft reply, and tasks
 */
export async function syncAndAnalyzeRealGmail(
  accessToken: string,
  onProgress?: (current: number, total: number, status: string) => void
): Promise<{
  emails: EmailMessage[];
  spamDeletedCount: number;
}> {
  onProgress?.(0, 0, "Connexion à la boîte Gmail du Coordinateur...");
  const rawList = await listGmailMessages(accessToken, 15);

  if (rawList.length === 0) {
    return { emails: [], spamDeletedCount: 0 };
  }

  const processedEmails: EmailMessage[] = [];
  let spamDeletedCount = 0;
  const total = rawList.length;

  for (let i = 0; i < total; i++) {
    const item = rawList[i];
    onProgress?.(i + 1, total, `Téléchargement et analyse du message ${i + 1}/${total}...`);

    try {
      const msg = await getGmailMessageDetail(accessToken, item.id);
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const fromRaw = getHeader('From');
      const subject = getHeader('Subject') || '(Sans objet)';
      const dateHeader = getHeader('Date');
      const receivedAt = dateHeader
        ? new Date(dateHeader).toISOString()
        : new Date(Number(msg.internalDate || Date.now())).toISOString();

      // Extract sender name and clean email
      let senderName = fromRaw;
      let senderEmail = fromRaw;
      const match = fromRaw.match(/(.*?)\s*<(.+?)>/);
      if (match) {
        senderName = match[1].replace(/["']/g, '').trim() || match[2];
        senderEmail = match[2].trim();
      }

      const bodyText = extractBodyFromPayload(msg.payload) || msg.snippet || '';

      // Heuristic detection for common advertising / newsletter spam keywords
      const isPromoNewsletter =
        subject.toLowerCase().includes('newsletter') ||
        subject.toLowerCase().includes('unsubscribe') ||
        subject.toLowerCase().includes('désabonner') ||
        subject.toLowerCase().includes('promo') ||
        subject.toLowerCase().includes('soldes') ||
        subject.toLowerCase().includes('remise ') ||
        senderEmail.includes('no-reply') ||
        senderEmail.includes('noreply') ||
        senderEmail.includes('marketing');

      // AI Analysis via backend or local
      const analysisResult = await analyzeEmailWithAI({
        senderName,
        senderEmail,
        subject,
        body: bodyText.slice(0, 1500),
      });

      const analysis = analysisResult.analysis;

      // If AI or rule classifies this as spam or off-topic advertising
      if (
        analysis.category === 'spam_hors_sujet' ||
        (isPromoNewsletter && !subject.toLowerCase().includes('ffmc'))
      ) {
        // Automatically filter out spam / unimportant emails
        spamDeletedCount++;
        continue;
      }

      processedEmails.push({
        id: `gmail-${msg.id}`,
        senderName,
        senderEmail,
        subject,
        snippet: msg.snippet || bodyText.slice(0, 120),
        body: bodyText || msg.snippet,
        receivedAt,
        category: (analysis.category as MailCategory) || 'contact_institutionnel',
        priority: (analysis.priority as TaskPriority) || 'p1',
        impactAnalysis:
          analysis.impactAnalysis ||
          "Analyse automatique FFMC 06 : Email reçu sur la boîte officielle.",
        suggestedReply:
          analysis.suggestedReply ||
          `Bonjour,\n\nLa FFMC 06 accuse bonne réception de votre message.\n\nFraternellement,\nLe Bureau FFMC 06`,
        replyStatus: 'pending',
        isRead: false,
        tasksExtracted: analysis.tasks || [],
      });
    } catch (err) {
      console.warn(`Erreur traitement email Gmail ${item.id}:`, err);
    }
  }

  return { emails: processedEmails, spamDeletedCount };
}
