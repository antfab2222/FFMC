import { getSupabaseClient } from "./supabaseService";
import type { CAMember, EmailMessage, NewsItem } from "../types";

export function database() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Connexion au service indisponible.");
  return client;
}
export async function invoke(name: string, body: Record<string, unknown>) {
  const client = database();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session)
    throw new Error("Reconnectez-vous au site avec votre compte autorisé.");
  const { data, error } = await client.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    if (error.context instanceof Response) {
      try {
        const result = await error.context.json();
        message = result.error || message;
      } catch {
        /* non JSON */
      }
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
export const mailAction = (
  action: string,
  extra: Record<string, unknown> = {},
) => invoke("mail-assistant", { action, ...extra });
export const gmailStatus = () => invoke("gmail-connect", { action: "status" });
export async function connectGmail() {
  const { url } = await invoke("gmail-connect", { action: "start" });
  if (new URL(url).origin !== "https://accounts.google.com")
    throw new Error("Adresse de connexion invalide.");
  window.location.assign(url);
}
export async function authenticatedMember(): Promise<CAMember | null> {
  const client = database();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user) return null;
  const { data, error } = await client
    .from("ca_members")
    .select("user_id,display_name,role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Ce compte n’est pas autorisé à accéder au CA.");
  return {
    id: data.user_id,
    name: data.display_name,
    email: user.email || "",
    role: data.role === "coordinateur" ? "coordinateur" : "membre",
    title:
      data.role === "coordinateur" ? "Coordinateur FFMC 06" : "Membre du CA",
  };
}
export async function fetchEmails(): Promise<EmailMessage[]> {
  const all: EmailMessage[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await database()
      .from("ca_mail_messages")
      .select("*")
      .order("sent_at", { ascending: false })
      .order("id")
      .range(offset, offset + 499);
    if (error) throw error;
    all.push(...data.map(mapMail));
    if (data.length < 500) return all;
  }
}
export function mapMail(row: any): EmailMessage {
  const sender = String(row.sender || "");
  const match = sender.match(/^(.*?)\s*<([^<>]+)>$/);
  const analysis = row.analysis;
  return {
    id: row.id,
    threadId: row.thread_id,
    senderName: match
      ? match[1].replace(/^"|"$/g, "").trim() || match[2]
      : sender,
    senderEmail: match?.[2] || sender,
    subject: row.subject,
    body: row.body,
    snippet: (analysis?.summary || row.body).slice(0, 220),
    receivedAt: row.sent_at,
    category: row.mail_category || "Correspondance",
    topic: row.mail_topic || "Autre",
    direction: row.direction,
    analysisEngine: analysis ? "Gemini" : "Classement automatique",
    analyzedAt: row.analyzed_at,
    priority:
      analysis?.priority === "Urgente"
        ? "p0"
        : analysis?.priority === "Importante"
          ? "p1"
          : "p2",
    impactAnalysis: analysis
      ? [
          analysis.summary,
          analysis.reason,
          analysis.discussion,
          analysis.uncertainties && `À vérifier : ${analysis.uncertainties}`,
        ]
          .filter(Boolean)
          .join("\n\n")
      : "Mail importé et classé. Analyse Gemini en attente.",
    suggestedReply: analysis?.reply_draft || "",
    replyStatus: "pending",
    isRead: false,
    truncated: row.truncated,
    tasksExtracted: [],
  };
}
export async function fetchNews(): Promise<NewsItem[]> {
  const { data, error } = await database()
    .from("ca_news_items")
    .select("*")
    .neq("status", "Clos")
    .order("published_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data.map((row: any) => {
    const refs = (row.source_refs || []).filter((s: any) =>
      /^https?:\/\//.test(s.url),
    );
    const mail = row.dedupe_key?.startsWith("gmail:");
    return {
      id: row.id,
      title: row.title,
      summary: row.body,
      source: mail ? "Courrier FFMC" : refs[0]?.label || "Veille sourcée",
      sourceUrl: refs[0]?.url || "",
      category:
        row.topic === "Manifestations"
          ? "manif"
          : row.topic === "Circulation et infrastructures"
            ? "infrastructure_06"
            : "reglementation",
      geographicalScope:
        row.news_scope === "Alpes-Maritimes"
          ? "06 - Alpes-Maritimes"
          : row.news_scope || "France",
      announcementType: row.news_type || "Information",
      impactLevel:
        row.importance === "À la une"
          ? "fort"
          : row.importance === "Important"
            ? "moyen"
            : "faible",
      publishedAt: row.published_at,
      searchDate: row.verified_at || row.updated,
      hash: row.dedupe_key,
      keyPoints: [row.impact, row.next_step].filter(Boolean),
      sourceRefs: refs,
      origin: mail ? "mail" : "veille",
      topic: row.topic,
    };
  });
}
