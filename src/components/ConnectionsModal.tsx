import React, { useEffect, useState } from "react";
import {
  connectGmail,
  gmailStatus,
  mailAction,
} from "../services/backendService";
export function ConnectionsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}) {
  const [connection, setConnection] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setConnection(null);
    setStatus(null);
    Promise.all([gmailStatus(), mailAction("status")])
      .then(([c, s]) => {
        setConnection(c);
        setStatus(s);
      })
      .catch((e) => setError(e.message));
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-lg space-y-4">
        <h2 className="font-bold">État des connexions</h2>
        {error && (
          <p role="alert" className="text-amber-700">
            {error}
          </p>
        )}
        <p>
          Gmail :{" "}
          {connection
            ? connection.connected
              ? "autorisation enregistrée"
              : "à connecter"
            : "vérification…"}
        </p>
        {status && (
          <>
            <p>
              Dernier import :{" "}
              {status.lastSync
                ? new Date(status.lastSync).toLocaleString("fr-FR")
                : "aucun"}
            </p>
            <p>
              Gemini : {status.aiEnabled ? "activé" : "non activé"} ·{" "}
              {status.pending} mails à analyser
            </p>
            <p className="text-sm text-amber-700">
              {status.aiError || status.syncError}
            </p>
          </>
        )}
        <button
          className="px-4 py-2 rounded bg-red-700 text-white"
          onClick={() => connectGmail().catch((e) => setError(e.message))}
        >
          {connection?.connected
            ? "Renouveler l’autorisation Google"
            : "Connecter Gmail"}
        </button>
        <button className="px-4 py-2" onClick={onClose}>
          Fermer
        </button>
      </section>
    </div>
  );
}
