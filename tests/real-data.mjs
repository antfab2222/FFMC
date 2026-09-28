import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
const asModule = async (source) =>
  import(
    "data:text/javascript;base64," +
      Buffer.from(compile(source)).toString("base64")
  );
const source = readFileSync("src/services/backendService.ts", "utf8").replace(
  /^import[\s\S]*?from\s+[\x27\x22][^\x27\x22]+[\x27\x22];?\n/gm,
  "",
);
const { mapMail } = await asModule(source);
const row = {
  id: "abc123",
  thread_id: "abc124",
  sender: "FFMC Réseau <reseau@example.org>",
  subject: "Ordre du jour",
  body: "Points proposés pour la réunion",
  sent_at: "2026-09-28T10:00:00Z",
  direction: "reçu",
  mail_category: "Ordres du jour",
  mail_topic: "Réunions et CA",
  analysis: null,
};
const pending = mapMail(row);
assert.equal(pending.category, "Ordres du jour");
assert.equal(pending.suggestedReply, "");
assert.equal(pending.analysisEngine, "Classement automatique");
assert.deepEqual(pending.tasksExtracted, []);
const analyzed = mapMail({
  ...row,
  analysis: {
    summary: "Résumé réellement enregistré",
    priority: "Importante",
    reason: "Décision à préparer",
    reply_draft: "Bonjour",
  },
  analyzed_at: "2026-09-28T11:00:00Z",
});
assert.equal(analyzed.priority, "p1");
assert.equal(analyzed.analysisEngine, "Gemini");
assert.equal(analyzed.suggestedReply, "Bonjour");
assert.equal(analyzed.senderEmail, "reseau@example.org");
const values = new Map();
globalThis.localStorage = {
  getItem: (k) => values.get(k) || null,
  setItem: (k, v) => values.set(k, v),
  removeItem: (k) => values.delete(k),
};
const defaults = readFileSync("src/data/defaults.ts", "utf8")
  .replace(/^import[\s\S]*?from\s+[\x27\x22][^\x27\x22]+[\x27\x22];?\n/gm, "")
  .replaceAll("export const", "const");
const ids = readFileSync("src/data/legacyDemoIds.ts", "utf8").replaceAll(
  "export const",
  "const",
);
const api = await asModule(
  defaults +
    ids +
    readFileSync("src/services/api.ts", "utf8").replace(/^import[\s\S]*?from\s+[\x27\x22][^\x27\x22]+[\x27\x22];?\n/gm, ""),
);
localStorage.setItem(
  "ffmc06_tasks_v1",
  JSON.stringify([
    { id: "tsk-001", title: "demo" },
    { id: "real-task", title: "ma tâche" },
    { id: "derived", sourceId: "eml-101", title: "from demo" },
  ]),
);
assert.deepEqual(
  api.getStoredTasks().map((x) => x.id),
  ["real-task"],
);
localStorage.setItem("ffmc06_emails_v1", JSON.stringify([row]));
assert.deepEqual(api.getStoredEmails(), []);
api.saveEmails([]);
assert.equal(localStorage.getItem("ffmc06_emails_v1"), null);
assert.deepEqual(api.getStoredNews(), []);
assert.deepEqual(api.getStoredCAMembers(), []);
assert.equal(api.getStoredCurrentUser().role, "membre");
console.log(
  "PASS: real mail mapping, no fabricated replies/tasks, exact demo removal preserves manual tasks, no cached private mail or default coordinator.",
);
