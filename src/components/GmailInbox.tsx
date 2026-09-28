import React, { useEffect, useState } from "react";
import {
  replyRecipient,
  replySubject,
  gmailComposeUrl,
  gmailThreadUrl,
} from "../lib/gmail-reply";
import { Mail, RefreshCw, ExternalLink, Search, Sparkles } from "lucide-react";
import type { EmailMessage, Task } from "../types";
import { MAIL_CATEGORIES, MAIL_TOPICS } from "../types/mail-taxonomy";
import {
  connectGmail,
  fetchEmails,
  gmailStatus,
  mailAction,
} from "../services/backendService";

interface Props {
  emails: EmailMessage[];
  onUpdateEmail: (email: EmailMessage) => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onPrepareCAShare?: (share: {
    title: string;
    content: string;
    sourceTitle: string;
    sourceId: string;
  }) => void;
  selectedEmailId?: string | null;
  onResetEmails?: () => void;
  onSetEmails?: (emails: EmailMessage[]) => void;
  onShowToast?: (msg: string) => void;
}
const field =
  "rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm";
const button =
  "rounded-lg bg-slate-100 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold disabled:opacity-40";
export function GmailInbox({
  emails,
  onUpdateEmail,
  onSetEmails,
  onPrepareCAShare,
  selectedEmailId,
}: Props) {
  const [selected, setSelected] = useState(selectedEmailId || "");
  const [connection, setConnection] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [topic, setTopic] = useState("all");
  const [direction, setDirection] = useState("reçu");
  const [smart, setSmart] = useState("important");
  const [reply, setReply] = useState("");
  const message = emails.find((e) => e.id === selected);
  async function reload() {
    const [c, s, messages] = await Promise.all([
      gmailStatus(),
      mailAction("status"),
      fetchEmails(),
    ]);
    setConnection(c);
    setStatus(s);
    onSetEmails?.(messages);
  }
  useEffect(() => {
    reload().catch((e) => setNotice(e.message));
  }, []);
  useEffect(() => {
    if (selectedEmailId) setSelected(selectedEmailId);
  }, [selectedEmailId]);
  useEffect(() => {
    setReply(message?.suggestedReply || "");
  }, [message?.id, message?.suggestedReply]);
  async function run(action: string) {
    setBusy(action);
    setNotice("");
    try {
      if (action === "connect") {
        await connectGmail();
        return;
      }
      if (action === "refresh") {
        await reload();
        return;
      }
      const result = await mailAction(action);
      setNotice(
        action === "sync"
          ? `${result.imported} nouveau(x) mail(s) importé(s). ${result.hasMore ? "Cliquez sur « Continuer l’import » pour la suite." : "Import à jour."}`
          : `${result.analyzed} mail(s) analysé(s). ${result.remainingToday} analyse(s) restante(s) aujourd’hui.`,
      );
      await reload();
    } catch (e: any) {
      setNotice(e.message);
      await reload().catch(() => {});
    } finally {
      setBusy("");
    }
  }
  async function file(changes: { category?: string; topic?: string }) {
    if (!message) return;
    setBusy("file");
    try {
      await mailAction("file", {
        id: message.id,
        category: changes.category || message.category,
        topic: changes.topic || message.topic || "Autre",
      });
      await reload();
      setNotice("Classement enregistré.");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy("");
    }
  }
  const smartMatch=(e:EmailMessage)=>{
    const text=(e.impactAnalysis||"").toLowerCase();
    if(smart==="all")return true;
    if(smart==="important")return e.priority==="p0"||e.priority==="p1";
    if(smart==="reply")return text.includes("à répondre")||Boolean(e.suggestedReply);
    if(smart==="decide")return text.includes("à débattre")||text.includes("décision");
    if(smart==="network")return /ffmc|infos-reseau|coordinateurs_|rdp-ffmc/i.test(e.senderEmail+" "+e.subject);
    if(smart==="news")return e.category==="Actualités"||e.category==="Newsletters";
    if(smart==="noise")return e.category==="Notifications et publicité"||(e.priority==="p2"&&!e.analyzedAt);
    return true;
  };
  const smartTabs=[
    ["important","Important",emails.filter(e=>e.priority==="p0"||e.priority==="p1").length],
    ["reply","À répondre",emails.filter(e=>(e.impactAnalysis||"").toLowerCase().includes("à répondre")||Boolean(e.suggestedReply)).length],
    ["decide","À décider",emails.filter(e=>/(à débattre|décision)/i.test(e.impactAnalysis||"")).length],
    ["network","Réseau FFMC",emails.filter(e=>/ffmc|infos-reseau|coordinateurs_|rdp-ffmc/i.test(e.senderEmail+" "+e.subject)).length],
    ["news","Actualités",emails.filter(e=>e.category==="Actualités"||e.category==="Newsletters").length],
    ["noise","Archives & bruit",emails.filter(e=>e.category==="Notifications et publicité"||(e.priority==="p2"&&!e.analyzedAt)).length],
    ["all","Tous",emails.length],
  ] as const;
  const filtered = emails.filter(
    (e) =>
      smartMatch(e) &&
      (category === "all" || e.category === category) &&
      (topic === "all" || e.topic === topic) &&
      (direction === "all" || e.direction === direction) &&
      `${e.subject} ${e.senderName} ${e.body}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const gmailUrl = message
    ? gmailThreadUrl(message.threadId || message.id)
    : "";
  const composeUrl = message
    ? gmailComposeUrl(
        replyRecipient(message.senderEmail, message.direction || "reçu"),
        replySubject(message.subject),
        reply,
      )
    : null;
  return (
    <div className="space-y-4">
      <section className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
        <h2 className="font-bold flex gap-2 items-center">
          <Mail size={20} /> Courrier Gmail · {emails.length} messages importés
        </h2>
        <p className="text-sm text-slate-500">
          {connection
            ? connection.connected
              ? `${connection.mailbox} · autorisation enregistrée`
              : "Gmail à connecter"
            : "Vérification de la connexion…"}
        </p>
        {status && (
          <p className="text-xs">
            Dernier import :{" "}
            {status.lastSync
              ? new Date(status.lastSync).toLocaleString("fr-FR")
              : "aucun"}{" "}
            · {status.aiNewOnlyAfter ? "IA : nouveaux mails uniquement" : status.pending+" mails en attente d’analyse"} ·{" "}
            {status.remainingToday}/20 analyses disponibles aujourd’hui ·{" "}
            {status.autoEnabled
              ? "Relève automatique activée (5 min)"
              : "Relève automatique désactivée"}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={!!busy}
            onClick={() => run("connect")}
          >
            {connection?.connected
              ? "Renouveler l’autorisation Google"
              : "Connecter Gmail"}
          </button>
          <button
            className={button}
            disabled={!!busy || !connection?.connected}
            onClick={() => run("sync")}
          >
            {status?.hasMore ? "Continuer l’import" : "Relever les mails"}
          </button>
          <button
            className={button}
            disabled={
              !!busy ||
              !status?.aiEnabled ||
              !(status?.aiNewOnlyAfter ? true : status?.pending) ||
              !status?.remainingToday
            }
            onClick={() => run("analyze")}
          >
            Analyser le prochain lot (3 mails)
          </button>
          <button
            className={button}
            disabled={!!busy}
            onClick={() => run("refresh")}
          >
            Actualiser
          </button>
        </div>
        {busy && (
          <p className="text-sm flex gap-2">
            <RefreshCw size={16} className="animate-spin" />
            Traitement en cours…
          </p>
        )}
        {status && !status.aiEnabled && (
          <p className="text-sm text-amber-700">
            L’analyse Gemini n’est pas activée sur le serveur. Les mails restent
            accessibles et classés.
          </p>
        )}
        {(notice || status?.aiError || status?.syncError) && (
          <p
            role="status"
            className="text-sm whitespace-pre-line p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg"
          >
            {[notice, status?.aiError, status?.syncError]
              .filter(Boolean)
              .join("\n")}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Import initial : 30 derniers jours, puis relève continue. Les pièces
          jointes restent à consulter dans Gmail. Les newsletters sont
          conservées et classées.
        </p>
      </section>
      <div className="grid sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {smartTabs.map(([id,label,count])=><button key={id} onClick={()=>setSmart(id)} className={`p-3 rounded-xl border text-left ${smart===id?"border-red-600 bg-red-50 dark:bg-red-950/20":"border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}><strong className="block text-sm">{label}</strong><span className="text-xl font-black">{count}</span></button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Rechercher un mail"
          className={`${field} flex-1`}
          placeholder="Expéditeur, objet ou contenu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Catégorie"
          className={field}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Toutes catégories</option>
          {MAIL_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Sujet"
          className={field}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="all">Tous sujets</option>
          {MAIL_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Sens du mail"
          className={field}
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="reçu">Reçus</option>
          <option value="envoyé">Envoyés</option>
          <option value="all">Tous les mails</option>
        </select>
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto max-h-[850px]">
          {!filtered.length && (
            <p className="p-6 text-sm text-slate-500">
              Aucun mail pour ces filtres.
            </p>
          )}
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`w-full text-left p-4 border-b border-slate-100 dark:border-zinc-800 ${e.id === selected ? "bg-red-50 dark:bg-red-950/30" : ""}`}
            >
              <span className="text-xs text-slate-500">
                {e.senderName} ·{" "}
                {new Date(e.receivedAt).toLocaleDateString("fr-FR")}
              </span>
              <strong className="block text-sm my-1">{e.subject}</strong>
              <span className="block text-xs line-clamp-2">{e.snippet}</span>
              <span className="block mt-2 text-xs text-slate-500">
                {e.category} · {e.topic} ·{" "}
                {e.analyzedAt ? "Analysé" : "À analyser"}
              </span>
            </button>
          ))}
        </section>
        <section className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          {!message ? (
            <p className="text-sm text-slate-500">
              Sélectionnez un mail pour lire son contenu et son analyse.
            </p>
          ) : (
            <>
              <h3 className="font-bold">{message.subject}</h3>
              <p className="text-xs text-slate-500">
                {message.direction} · {message.senderEmail} ·{" "}
                {new Date(message.receivedAt).toLocaleString("fr-FR")}
              </p>
              <a
                href={gmailUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-red-700 underline"
              >
                Ouvrir le fil et les pièces jointes dans Gmail ↗
              </a>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Modifier la catégorie"
                  className={field}
                  disabled={!!busy}
                  value={message.category}
                  onChange={(e) => file({ category: e.target.value })}
                >
                  {MAIL_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  aria-label="Modifier le sujet"
                  className={field}
                  disabled={!!busy}
                  value={message.topic}
                  onChange={(e) => file({ topic: e.target.value })}
                >
                  {MAIL_TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 text-sm whitespace-pre-line">
                <strong className="block mb-2">
                  {message.analysisEngine} · à relire
                </strong>
                {message.impactAnalysis}
              </div>
              <details>
                <summary className="cursor-pointer text-sm font-semibold">
                  Lire le mail original
                  {message.truncated ? " (extrait tronqué)" : ""}
                </summary>
                <p className="whitespace-pre-wrap break-words text-sm mt-3 max-h-96 overflow-auto">
                  {message.body}
                </p>
              </details>
              {message.direction !== "envoyé" && (
                <>
                  <label
                    className="block text-sm font-semibold"
                    htmlFor="reply"
                  >
                    Proposition de réponse modifiable
                  </label>
                  <textarea
                    id="reply"
                    className={`${field} w-full`}
                    rows={8}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Aucun brouillon disponible. Vous pouvez rédiger votre réponse ici."
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={button}
                      disabled={!reply.trim()}
                      onClick={() => {
                        onUpdateEmail({
                          ...message,
                          suggestedReply: reply,
                          replyStatus: "drafted",
                        });
                        setNotice("Brouillon conservé pour cette session.");
                      }}
                    >
                      Conserver le brouillon
                    </button>
                    <a
                      className={`${button} text-red-700`}
                      href={composeUrl || gmailUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {composeUrl
                        ? "Préparer dans Gmail ↗"
                        : "Ouvrir Gmail ↗"}
                    </a>
                    <button
                      className={button}
                      disabled={!reply.trim()}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(reply)
                          .then(() => setNotice("Réponse copiée."))
                          .catch(() =>
                            setNotice(
                              "Copie impossible : sélectionnez le texte manuellement.",
                            ),
                          )
                      }
                    >
                      Copier la réponse
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Relisez le destinataire et la réponse dans Gmail avant
                    l’envoi.
                  </p>
                </>
              )}
              {onPrepareCAShare && (
                <button
                  className={button}
                  onClick={() =>
                    onPrepareCAShare({
                      title: `Synthèse : ${message.subject}`,
                      content: message.impactAnalysis,
                      sourceTitle: message.subject,
                      sourceId: message.id,
                    })
                  }
                >
                  Préparer une synthèse pour le CA
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
