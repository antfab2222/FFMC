import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory runtime state for Cron & logs
let cronConfig = {
  enabled: true,
  intervalMinutes: 15,
  lastRunAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  nextRunAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  isRunning: false,
  autoExtractTasks: true,
  gmailActive: true,
  rssActive: true,
};

let cronLogs = [
  {
    id: 'log-srv-01',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    source: 'gmail',
    status: 'success',
    message: 'Relève automatique Gmail : boîte inspectée, boîtes de réception synchronisées.',
    itemsProcessed: 4,
    tasksCreated: 1,
    durationMs: 1240,
  },
  {
    id: 'log-srv-02',
    timestamp: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
    source: 'rss',
    status: 'success',
    message: 'Ingestion flux RSS Légifrance & Métropole NCA : 2 articles agrégés après déduplication.',
    itemsProcessed: 6,
    tasksCreated: 0,
    durationMs: 780,
  },
];

// Initialize Gemini if key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
    console.log('Gemini AI Client initialized successfully.');
  } catch (err) {
    console.warn('Could not initialize Gemini Client:', err);
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Centre de Commande FFMC 06',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Email Analysis Endpoint
app.post('/api/mail/analyze', async (req, res) => {
  const { senderName, senderEmail, subject, body } = req.body;

  if (!body && !subject) {
    return res.status(400).json({ error: 'Subject or body is required' });
  }

  // If Gemini is available, use gemini-3.8-flash
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Tu es l'assistant d'analyse d'emails de l'antenne FFMC 06 (Fédération Française des Motards en Colère des Alpes-Maritimes).
Analyse l'email suivant reçu par l'antenne :
EXPÉDITEUR: ${senderName} (${senderEmail})
OBJET: ${subject}
CORPS:
${body}

Tu dois impérativement répondre en JSON STRICT conforme au format suivant :
{
  "category": "danger_voirie_infrastructure" | "contact_institutionnel" | "adhesion_sympathisant" | "reclamation_adherent" | "manif_evenement" | "presse_media" | "reunion_bureau" | "spam_hors_sujet",
  "priority": "p0" | "p1" | "p2" | "p3",
  "impactAnalysis": "Analyse concise de l'impact pour les motards des Alpes-Maritimes et la stratégie de la FFMC 06",
  "suggestedReply": "Proposition de réponse soignée, fraternelle ou institutionnelle selon l'interlocuteur, prête pour validation humaine",
  "tasks": [
    {
      "title": "Titre clair et opérationnel de la tâche",
      "description": "Description des actions à mener",
      "assignee": "Jean-Marc (Commission Voirie)" | "Antoine (Coordinateur)" | "Sophie (Trésorière/Adhésions)" | "Marc (Relations Presse)" | "Bureau FFMC 06",
      "dueDate": "YYYY-MM-DD",
      "priority": "p0" | "p1" | "p2" | "p3"
    }
  ]
}
Notes:
- p0 = Danger mortel immédiat, urgence vitale ou échéance à moins de 24h.
- p1 = Institutionnel, média à forte audience, convocation officielle.
- p2 = Adhésion, suivi ordinaire, question technique.
- p3 = Info basse priorité.
Ne renvoie AUCUN texte avant ou après le JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json({ success: true, analysis: parsed, engine: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.error('Gemini analysis error:', err);
      // Fallback below
    }
  }

  // Heuristic / rule-based fallback if Gemini is offline
  const lower = `${subject} ${body}`.toLowerCase();
  let category: string = 'adhesion_sympathisant';
  let priority: string = 'p2';
  let assignee = 'Bureau FFMC 06';

  if (lower.includes('danger') || lower.includes('nid-de-poule') || lower.includes('glissière') || lower.includes('béton') || lower.includes('gravillon') || lower.includes('chute') || lower.includes('route')) {
    category = 'danger_voirie_infrastructure';
    priority = lower.includes('mortel') || lower.includes('urgent') ? 'p0' : 'p1';
    assignee = 'Jean-Marc (Commission Voirie)';
  } else if (lower.includes('métropole') || lower.includes('mairie') || lower.includes('préfet') || lower.includes('police') || lower.includes('convocation') || lower.includes('décret')) {
    category = 'contact_institutionnel';
    priority = 'p1';
    assignee = 'Antoine (Coordinateur)';
  } else if (lower.includes('interview') || lower.includes('nice-matin') || lower.includes('journal') || lower.includes('bfm') || lower.includes('média')) {
    category = 'presse_media';
    priority = 'p1';
    assignee = 'Marc (Relations Presse)';
  } else if (lower.includes('manif') || lower.includes('rassemblement') || lower.includes('cortège') || lower.includes('balade')) {
    category = 'manif_evenement';
    priority = 'p1';
    assignee = 'Bureau FFMC 06';
  } else if (lower.includes('adhésion') || lower.includes('adhérer') || lower.includes('cotisation') || lower.includes('carte')) {
    category = 'adhesion_sympathisant';
    priority = 'p2';
    assignee = 'Sophie (Trésorière/Adhésions)';
  }

  const dueDate = new Date(Date.now() + (priority === 'p0' ? 86400000 : priority === 'p1' ? 172800000 : 345600000))
    .toISOString()
    .split('T')[0];

  res.json({
    success: true,
    engine: 'heuristic-rules',
    analysis: {
      category,
      priority,
      impactAnalysis: `Analyse automatique pour l'antenne FFMC 06 : sujet classé en ${category} avec priorité ${priority}. Requiert attention pour la défense des motards des Alpes-Maritimes.`,
      suggestedReply: `Bonjour,\n\nLa FFMC 06 accuse bonne réception de votre message concernant "${subject}".\n\nNotre équipe prend en charge votre demande et vous tiendra informé des actions entreprises sur le terrain et auprès des collectivités locales du 06.\n\nAppel de phare solidaire,\nLe Bureau FFMC 06`,
      tasks: [
        {
          title: `Traiter : ${subject.slice(0, 70)}`,
          description: `Action extraite automatiquement : ${subject}. Examiner la requête et répondre.`,
          assignee,
          dueDate,
          priority,
        },
      ],
    },
  });
});

// Cron Status & Configuration API
app.get('/api/cron/status', (req, res) => {
  res.json({
    config: cronConfig,
    logs: cronLogs.slice(0, 15),
  });
});

app.post('/api/cron/config', (req, res) => {
  const { enabled, intervalMinutes, autoExtractTasks, gmailActive, rssActive } = req.body;
  if (enabled !== undefined) cronConfig.enabled = enabled;
  if (intervalMinutes !== undefined) cronConfig.intervalMinutes = Number(intervalMinutes);
  if (autoExtractTasks !== undefined) cronConfig.autoExtractTasks = autoExtractTasks;
  if (gmailActive !== undefined) cronConfig.gmailActive = gmailActive;
  if (rssActive !== undefined) cronConfig.rssActive = rssActive;

  res.json({ success: true, config: cronConfig });
});

app.post('/api/cron/trigger', (req, res) => {
  const startTime = Date.now();
  cronConfig.isRunning = true;
  cronConfig.lastRunAt = new Date().toISOString();
  cronConfig.nextRunAt = new Date(Date.now() + cronConfig.intervalMinutes * 60 * 1000).toISOString();

  // Simulate automated execution: check emails & check RSS
  const simulatedNewEmailFound = Math.random() > 0.4;
  const itemsCount = simulatedNewEmailFound ? Math.floor(Math.random() * 3) + 1 : 0;
  const tasksCount = simulatedNewEmailFound ? 1 : 0;

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'gmail',
    status: 'success',
    message: simulatedNewEmailFound
      ? `Relève automatique réussie : ${itemsCount} email(s) inspecté(s), ${tasksCount} action(s) prioritaire(s) insérée(s) dans le tableau de bord.`
      : `Relève automatique effectuée : aucun nouvel email non traité. Boîte à jour.`,
    itemsProcessed: itemsCount,
    tasksCreated: tasksCount,
    durationMs: Date.now() - startTime + 420,
  };

  cronLogs.unshift(newLog);
  cronConfig.isRunning = false;

  res.json({
    success: true,
    log: newLog,
    config: cronConfig,
  });
});

// RSS Aggregator & Deduplication Endpoint
app.get('/api/rss/fetch', (req, res) => {
  // Real official feeds simulation with semantic deduplication
  const rawFeeds = [
    {
      id: 'rss-1',
      title: 'Métropole Nice Côte d’Azur : Nouvel arrêté ZFE sur la bande côtière',
      summary: 'Extension des zones soumises à vignettes Crit’Air avec renforcement des contrôles LAPI sur les axes littoraux.',
      source: 'Métropole Nice Côte d’Azur',
      sourceUrl: 'https://nicecotedazur.org/arretes-voirie-zfe-2026',
      category: 'infrastructure_06',
      impactLevel: 'fort',
      publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      keyPoints: ['Contrôles LAPI envisagés', 'Impact fort sur les motards du littoral 06'],
    },
    {
      id: 'rss-2',
      title: 'Conseil d’État : Décision relative aux modalités d’application du contrôle technique moto',
      summary: 'Confirmation du cadre européen avec rappel strict de l’interdiction des contrôles disproportionnés ou discriminatoires.',
      source: 'Légifrance',
      sourceUrl: 'https://www.legifrance.gouv.fr/circulaire-ct2m-cadre',
      category: 'juridique',
      impactLevel: 'fort',
      publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      keyPoints: ['Rappel de la proportionnalité des verbalisations', 'Soutien aux arguments de la FFMC'],
    },
    {
      id: 'rss-3',
      title: 'FFMC Nationale : Appel à la mobilisation générale le 17 octobre 2026',
      summary: 'Les 89 antennes départementales sont appelées à manifester pour la sécurité routière et contre le racket financier.',
      source: 'FFMC Nationale',
      sourceUrl: 'https://ffmc.asso.fr/manif-nationale-octobre-2026',
      category: 'manif',
      impactLevel: 'fort',
      publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      keyPoints: ['Samedi 17 octobre 2026', 'Cortège régional Nice-Cannes-Antibes'],
    },
    {
      id: 'rss-4',
      title: 'Sécurité Routière : Chiffres ONISR de l’accidentalité 2RM PACA premier semestre',
      summary: 'Focus sur l’état des revêtements et l’adhérence des bandes de résine dans les virages alpins.',
      source: 'Sécurité Routière',
      sourceUrl: 'https://securite-routiere.gouv.fr/bilan-paca-2026-s1',
      category: 'securite_routiere',
      impactLevel: 'moyen',
      publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      keyPoints: ['38% des accidents liés aux défauts de voirie', 'Argument clé pour les réunions avec le CD06'],
    },
    {
      id: 'rss-5',
      title: 'DDTM 06 : Travaux de sécurisation et purges de falaises dans les Gorges de la Mescla (RD6202)',
      summary: 'Alternats de circulation et risques de gravillons fins sur la chaussée jusqu’au 16 octobre.',
      source: 'DDTM 06',
      sourceUrl: 'https://inforoutes06.fr/travaux-mescla-octobre',
      category: 'infrastructure_06',
      impactLevel: 'moyen',
      publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      keyPoints: ['Gravillons résiduels', 'Alerte à diffuser aux motards de la vallée du Var'],
    },
  ];

  // Semantic Deduplication logic:
  // Normalize titles, filter duplicates using key tokens
  const seenTitles = new Set<string>();
  const deduplicated = rawFeeds.filter((item) => {
    const simplified = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .slice(0, 5)
      .join(' ');
    if (seenTitles.has(simplified)) {
      return false;
    }
    seenTitles.add(simplified);
    return true;
  });

  res.json({
    success: true,
    totalRaw: rawFeeds.length,
    totalDeduplicated: deduplicated.length,
    items: deduplicated,
  });
});

// Vite Middleware for SPA development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production if needed
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Centre de Commande FFMC 06 server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
