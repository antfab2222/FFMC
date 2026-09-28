import { Task, EmailMessage, Meeting, NewsItem, CronConfig, CronLog, MorningBriefing, CAShare } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-001',
    title: 'Expertiser le séparateur béton non balisé sur la RM6202 (Mallemort / Plan du Var)',
    description: 'Signalement urgent d’un motard adhérent : nouveau plot en béton posé sans éclairage ni chevron réfléchissant en sortie de virage sur la 202 bis. Risque mortel en 2RM nocturne.',
    status: 'in_progress',
    priority: 'p0',
    assignee: 'Jean-Marc (Commission Voirie)',
    dueDate: '2026-09-29',
    sourceType: 'email',
    sourceId: 'eml-101',
    sourceTitle: 'DANGER MORTEL : Plot béton non signalé sur RM6202 vers Plan du Var',
    sourceSnippet: 'Vendredi soir en rentrant du boulot en moto, j’ai failli percuter un muret en béton non rétro-éclairé installé récemment...',
    tags: ['Voirie', 'Danger Mortel', 'Métropole NCA', 'RM6202'],
    createdAt: '2026-09-27T08:30:00Z',
    updatedAt: '2026-09-27T14:15:00Z',
  },
  {
    id: 'tsk-002',
    title: 'Rédiger courrier formel au Préfet 06 concernant les contrôles ciblant le CT2M à Nice Nord',
    description: 'Réfutation juridique des opérations ciblées menées samedi dernier sur le boulevard Gorbella. Rappeler le moratoire demandé par la FFMC Nationale et le flou sur les bancs de mesure sonore.',
    status: 'todo',
    priority: 'p1',
    assignee: 'Antoine (Coordinateur)',
    dueDate: '2026-09-30',
    sourceType: 'meeting',
    sourceId: 'mtg-201',
    sourceTitle: 'Réunion de rentrée du Bureau FFMC 06',
    sourceSnippet: 'Point 3 de l’ordre du jour : recrudescence des contrôles zélés sur Nice Nord. Nécessité d’une réponse juridique argumentée.',
    tags: ['Juridique', 'CT2M', 'Préfecture 06', 'Nice'],
    createdAt: '2026-09-26T19:00:00Z',
    updatedAt: '2026-09-26T19:00:00Z',
  },
  {
    id: 'tsk-003',
    title: 'Préparer l’ordre du jour de la réunion avec la Direction des Transports de Nice Côte d’Azur',
    description: 'Dossiers prioritaires : élargissement de l’expérimentation des couloirs de bus aux motos/scooters sur la voie Mathis et la Promenade des Anglais, et doublement des rails de sécurité dans les virages de la pénétrante du Paillon.',
    status: 'waiting',
    priority: 'p1',
    assignee: 'Antoine (Coordinateur)',
    dueDate: '2026-10-02',
    sourceType: 'email',
    sourceId: 'eml-102',
    sourceTitle: 'Convocation commission sécurité des mobilités - Métropole Nice',
    sourceSnippet: 'Monsieur le Coordinateur, le service Mobilités vous convie à un atelier de concertation le 8 octobre...',
    tags: ['Concertation', 'Couloirs Bus', 'Métropole', 'Glissières'],
    createdAt: '2026-09-25T11:20:00Z',
    updatedAt: '2026-09-27T09:40:00Z',
  },
  {
    id: 'tsk-004',
    title: 'Envoyer les packs de bienvenue et cartes d’adhérents aux 14 nouveaux inscrits de septembre',
    description: 'Impression des cartes 2026/2027, ajout des autocollants FFMC 06 et envoi postal groupé.',
    status: 'todo',
    priority: 'p2',
    assignee: 'Sophie (Trésorière/Adhésions)',
    dueDate: '2026-10-03',
    sourceType: 'manual',
    sourceTitle: 'Gestion des adhésions web',
    sourceSnippet: 'Campagne de renouvellement post-rentrée et forum des associations.',
    tags: ['Adhésions', 'Boutique', 'Secrétariat'],
    createdAt: '2026-09-24T16:00:00Z',
    updatedAt: '2026-09-24T16:00:00Z',
  },
  {
    id: 'tsk-005',
    title: 'Valider et relire le communiqué de presse sur la ZFE Nice et les dérogations 2RM',
    description: 'Communiqué à destination de Nice-Matin, BFM Nice Côte d’Azur et France 3 Côte d’Azur rappelant que les deux-roues motorisés fluidifient le trafic et ne doivent pas être exclus des axes périphériques.',
    status: 'in_progress',
    priority: 'p1',
    assignee: 'Marc (Relations Presse)',
    dueDate: '2026-09-29',
    sourceType: 'news',
    sourceId: 'nws-301',
    sourceTitle: 'Arrêté Métropolitain : Nouvelles restrictions ZFE sur la bande côtière',
    sourceSnippet: 'La Métropole annonce le durcissement des vignettes Crit’Air à partir du 1er novembre avec déploiement des caméras LAPI...',
    tags: ['Presse', 'ZFE', 'Nice-Matin', 'Communication'],
    createdAt: '2026-09-27T10:15:00Z',
    updatedAt: '2026-09-27T16:30:00Z',
  },
  {
    id: 'tsk-006',
    title: 'Inspection des glissières non doublées au Col de Vence (RD2)',
    description: 'Relevé GPS et prises de vue des rails métalliques nus en sortie de courbes pour constitution du dossier noir voirie à remettre au Conseil Départemental 06.',
    status: 'completed',
    priority: 'p2',
    assignee: 'Jean-Marc (Commission Voirie)',
    dueDate: '2026-09-26',
    sourceType: 'manual',
    sourceTitle: 'Campagne Voirie Haut-Pays 2026',
    sourceSnippet: 'Ronde programmée suite à la chute sans gravité d’un adhérent causée par des gravillons d’enrobé non balayés.',
    tags: ['Voirie', 'Col de Vence', 'CD06', 'Rapport'],
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-09-26T17:30:00Z',
  },
  {
    id: 'tsk-007',
    title: 'Mettre à jour le fichier des sympathisants motards pour la manif nationale d’octobre',
    description: 'Vérification des adresses emails et numéros de téléphone pour l’envoi de la newsletter d’appel au rassemblement au départ du Théâtre de Verdure.',
    status: 'todo',
    priority: 'p3',
    assignee: 'Sophie (Trésorière/Adhésions)',
    dueDate: '2026-10-06',
    sourceType: 'meeting',
    sourceId: 'mtg-201',
    sourceTitle: 'Réunion de rentrée du Bureau FFMC 06',
    sourceSnippet: 'Mobilisation prévue à Nice en synergie avec la FFMC 83 (Var) et FFMC 13.',
    tags: ['Manif', 'Mobilisation', 'Mailing'],
    createdAt: '2026-09-26T20:10:00Z',
    updatedAt: '2026-09-26T20:10:00Z',
  },
];

export const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'eml-101',
    senderName: 'Christophe L. (Adhérent #1488)',
    senderEmail: 'c.lefevre.moto@free.fr',
    subject: 'DANGER MORTEL : Plot béton non signalé sur RM6202 vers Plan du Var',
    snippet: 'Vendredi soir en rentrant du boulot en moto, j’ai failli percuter un muret en béton non rétro-éclairé installé récemment...',
    body: `Salut l'équipe de la FFMC 06,

Je vous alerte d'urgence sur un danger mortel apparu il y a 48 heures sur la RM6202 (sens montant vers Plan-du-Var / Mallemort, juste après le rond-point des Iscles).

L'entreprise de travaux a déposé des blocs GBA en béton brut au beau milieu de la trajectoire pour créer un tourne-à-gauche provisoire. Il n'y a STRICTEMENT AUCUN panneau de danger lumineux, aucune bande rétro-réfléchissante et pas de limitation préventive. De nuit, sous la pluie ou avec les phares des véhicules d'en face, c'est un piège invisible.

J'ai manqué de m'y encastrer vendredi soir. Il faut que l'antenne intervienne immédiatement auprès des services voirie de la Métropole avant qu'un motard ou scootériste ne s'y tue ce week-end !

Fraternellement,
Christophe - BMW R1250GS`,
    receivedAt: '2026-09-27T21:40:00Z',
    category: 'danger_voirie_infrastructure',
    priority: 'p0',
    impactAnalysis: 'Risque vital avéré pour les usagers de 2RM sur un axe à fort trafic pendulaire (RM6202). Nécessite une mise en demeure immédiate des services techniques de la Métropole Nice Côte d’Azur et de la Subdivision de la Tinée.',
    suggestedReply: `Bonjour Christophe,

Merci pour ce signalement précis et critique. La commission Voirie de la FFMC 06 prend le dossier en charge sans délai.

Une fiche de danger grave et imminent est transmise ce matin même à l'astreinte voirie de la Métropole Nice Côte d'Azur ainsi qu'au gestionnaire de district, avec copie à la gendarmerie locale. Nous exigeons la pose immédiate de balises K8 / K5c rétro-réfléchissantes et de feux clignotants de chantier.

Un de nos militants passera sur zone pour constater la conformité de la sécurisation. Nous te tenons informé des suites données.

Appel de phare solidaire,
Commission Sécurité & Voirie - FFMC 06`,
    replyStatus: 'pending',
    isRead: false,
    tasksExtracted: [
      {
        title: 'Expertiser le séparateur béton non balisé sur la RM6202 (Mallemort / Plan du Var)',
        assignee: 'Jean-Marc (Commission Voirie)',
        dueDate: '2026-09-29',
        priority: 'p0',
        taskId: 'tsk-001',
      },
      {
        title: 'Envoyer mise en demeure au service Astreinte Voirie Métropole NCA',
        assignee: 'Antoine (Coordinateur)',
        dueDate: '2026-09-28',
        priority: 'p0',
      },
    ],
  },
  {
    id: 'eml-102',
    senderName: 'Direction Générale des Mobilités - Métropole Nice',
    senderEmail: 'mobilites.amenagements@nicecotedazur.org',
    subject: 'Convocation commission sécurité des mobilités - Métropole Nice',
    snippet: 'Monsieur le Coordinateur, le service Mobilités vous convie à un atelier de concertation le 8 octobre...',
    body: `Monsieur le Coordinateur de la FFMC 06,

Dans le cadre de la révision triennale du Plan de Mobilités Actives et Partagées, la Métropole Nice Côte d'Azur a le plaisir de convier l'antenne locale de la Fédération Française des Motards en Colère à la prochaine commission consultative.

Ordre du jour préliminaire :
1. Bilan d'accidentalité 2RM premier semestre 2026 dans le périmètre métropolitain.
2. Évaluation du dispositif d'autorisation expérimentale des deux-roues motorisés sur les voies réservées aux transports en commun (axes Gambetta et Californie).
3. Projet de réaménagement des places de stationnement 2RM en surface et tarification en sous-sol.

La séance se tiendra le jeudi 8 octobre à 14h30 en salle du Conseil métropolitain (Immeuble Plaza, Nice).

Merci de nous confirmer la composition de votre délégation (2 représentants maximum) avant le vendredi 2 octobre.

Bien cordialement,
Le secrétariat général des mobilités
Métropole Nice Côte d'Azur`,
    receivedAt: '2026-09-25T11:20:00Z',
    category: 'contact_institutionnel',
    priority: 'p1',
    impactAnalysis: 'Rencontre institutionnelle stratégique. Enjeux majeurs : pérennisation des couloirs de bus pour les 2RM niçois, maintien de la gratuité du stationnement 2RM de surface et sécurisation des glissières.',
    suggestedReply: `Madame, Monsieur,

La FFMC 06 accuse réception de votre convocation pour la commission du jeudi 8 octobre 2026.

Nous confirmons notre présence. Notre délégation sera composée de :
- Antoine F. (Coordinateur départemental FFMC 06)
- Jean-Marc D. (Responsable de la Commission Voirie et Infrastructures)

Nous vous transmettrons en amont une note de synthèse présentant nos relevés d'aménagements accidentogènes récents ainsi que notre argumentaire technique en faveur de l'extension des couloirs de bus sur la voie Mathis.

Restant à votre disposition,
Le Bureau FFMC 06`,
    replyStatus: 'approved',
    isRead: true,
    tasksExtracted: [
      {
        title: 'Préparer l’ordre du jour de la réunion avec la Direction des Transports de Nice Côte d’Azur',
        assignee: 'Antoine (Coordinateur)',
        dueDate: '2026-10-02',
        priority: 'p1',
        taskId: 'tsk-003',
      },
    ],
  },
  {
    id: 'eml-103',
    senderName: 'Romain B. (Motard Nice Ouest)',
    senderEmail: 'romain.biker06@gmail.com',
    subject: 'Question adhésion 2026-2027 et engagement bénévolat',
    snippet: 'Bonjour, motard depuis 6 ans sur Nice, je souhaite adhérer et donner un coup de main pour les manifs...',
    body: `Bonjour la FFMC 06,

Je roule quotidiennement entre Grasse et Nice pour le travail. Face à la multiplication des contrôles techniques abusifs et à l'état dégradé de certaines routes de l'arrière-pays, je souhaite enfin adhérer officiellement pour soutenir vos actions.

Est-il possible d'adhérer par chèque ou directement en ligne ? De plus, ayant des compétences en graphisme et montage vidéo, je serais ravi de filer un coup de main bénévole pour vos réseaux sociaux ou pour filmer lors des prochaines manifestations.

Quand a lieu votre prochaine permanence ou rassemblement ?

V à tous,
Romain`,
    receivedAt: '2026-09-26T15:10:00Z',
    category: 'adhesion_sympathisant',
    priority: 'p2',
    impactAnalysis: 'Nouvel adhérent motivé avec compétences clés (création graphique / vidéo) indispensables pour notre communication militante.',
    suggestedReply: `Salut Romain,

Bienvenue à la FFMC 06 ! C'est grâce à des motards engagés comme toi que notre voix porte face aux décideurs.

Tu peux adhérer en quelques clics sur notre plateforme sécurisée (ou par courrier/chèque). Tu recevras ensuite ta carte de membre, ton autocollant FFMC et l'accès à nos groupes d'action.

Tes compétences en vidéo et communication nous intéressent énormément ! Nous tenons notre prochaine réunion mensuelle ouverte le vendredi 9 octobre à 19h30 à la Maison des Associations de Nice Garibaldi. Passe nous voir pour boire un verre et faire connaissance !

Fraternellement,
Sophie - Pôle Adhésions & Vie de l'antenne FFMC 06`,
    replyStatus: 'drafted',
    isRead: true,
    tasksExtracted: [
      {
        title: 'Envoyer formulaire d’adhésion et inviter Romain à la réunion du 9 octobre',
        assignee: 'Sophie (Trésorière/Adhésions)',
        dueDate: '2026-09-30',
        priority: 'p2',
      },
    ],
  },
  {
    id: 'eml-104',
    senderName: 'Rédaction Nice-Matin (Pôle Faits Divers & Transports)',
    senderEmail: 'redaction-nice@nicematin.fr',
    subject: 'Demande interview : Réaction FFMC 06 suite au nouveau dispositif ZFE à Nice',
    snippet: 'Bonjour, suite à la parution du nouvel arrêté ZFE sur Nice côtière, nous préparons un dossier grand format...',
    body: `Bonjour Monsieur le Coordinateur,

Suite à la parution du nouvel arrêté préfectoral et métropolitain durcissant le périmètre de la Zone à Faibles Émissions (ZFE) sur la bande côtière et la Promenade des Anglais, la rédaction de Nice-Matin prépare un dossier d'ouverture pour l'édition de mercredi.

Nous souhaiterions recueillir la position officielle de la FFMC 06 :
1. Quelle est votre analyse quant à l'impact sur les usagers de deux-roues motorisés ?
2. Envisagez-vous un recours gracieux ou des actions de protestation ?
3. Quelles alternatives préconisez-vous pour les salariés modestes ne pouvant changer de véhicule ?

Seriez-vous disponible pour un court entretien téléphonique ou un passage à nos locaux d'ici demain 15h ?

Bien cordialement,
Laurent V. - Journaliste Mobilités & Région
Nice-Matin`,
    receivedAt: '2026-09-27T17:35:00Z',
    category: 'presse_media',
    priority: 'p1',
    impactAnalysis: 'Opportunité média majeure pour sensibiliser le grand public niçois au rôle écologique et anti-embouteillage des 2RM, et dénoncer une mesure d’exclusion sociale touchant les travailleurs.',
    suggestedReply: `Bonjour Monsieur V.,

La FFMC 06 répond favorablement à votre sollicitation. La question de la ZFE niçoise et de l'exclusion infondée des deux-roues motorisés est au cœur de notre combat citoyen.

Notre coordinateur Antoine F. ou notre chargé de relations presse Marc D. se tient à votre disposition pour un entretien ce mardi à 11h30 (tél ou en rédaction).

Nous vous joignons par avance notre communiqué officiel ainsi que nos données comparatives sur la fluidification du trafic par les 2RM.

Bien cordialement,
Marc D. - Relations Presse FFMC 06`,
    replyStatus: 'pending',
    isRead: false,
    tasksExtracted: [
      {
        title: 'Contacter Laurent V. (Nice-Matin) pour caler l’interview ZFE ce mardi matin',
        assignee: 'Marc (Relations Presse)',
        dueDate: '2026-09-29',
        priority: 'p1',
      },
    ],
  },
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'nws-301',
    title: 'Métropole Nice Côte d’Azur : Nouvel arrêté durcissant le contrôle automatisé LAPI en ZFE côtière',
    summary: 'La Métropole officialise l’expérimentation de portiques de contrôle par lecture automatisée de plaques (LAPI) dès la fin d’année sur la voie rapide urbaine et la Promenade des Anglais, sans dérogation claire pour les motards et scooters.',
    source: 'Métropole Nice Côte d’Azur',
    sourceUrl: 'https://nicecotedazur.org/arretes-voirie-zfe-2026',
    category: 'infrastructure_06',
    geographicalScope: '06 - Alpes-Maritimes',
    announcementType: 'Arrêté préfectoral / métropolitain',
    impactLevel: 'fort',
    publishedAt: '2026-09-27T07:15:00Z',
    searchDate: '2026-09-28T03:30:00Z',
    hash: 'hash-zfe-nice-lapi-2026',
    keyPoints: [
      'Contrôle sanction automatisé envisagé d’ici fin 2026',
      'Pas de dérogation explicite mentionnée pour les 2RM de plus de 15 ans',
      'Risque élevé d’amendes forfaitaires pour les trajets domicile-travail',
    ],
    bookmarked: true,
  },
  {
    id: 'nws-302',
    title: 'Conseil d’État / Légifrance : Rejet des recours sur le contrôle technique moto mais rappel de la proportionnalité des sanctions',
    summary: 'La haute juridiction valide le cadre réglementaire du contrôle technique des catégories L, mais souligne que les contrôles de police doivent s’exercer sans discrimination ni traque excessive des usagers.',
    source: 'Légifrance',
    sourceUrl: 'https://www.legifrance.gouv.fr/circulaire-ct2m-cadre',
    category: 'juridique',
    geographicalScope: 'France',
    announcementType: 'Législation',
    impactLevel: 'fort',
    publishedAt: '2026-09-25T14:00:00Z',
    searchDate: '2026-09-28T03:30:00Z',
    hash: 'hash-legifrance-ct2m-proportionnalite',
    keyPoints: [
      'Obligation maintenue juridiquement',
      'Le boycott citoyen FFMC reste le levier politique essentiel',
      'Argument juridique à opposer lors des contrôles ciblés non justifiés',
    ],
    bookmarked: true,
  },
  {
    id: 'nws-303',
    title: 'FFMC Nationale : Appel à une journée de mobilisation interdépartementale le 17 octobre',
    summary: 'Le Bureau National appelle l’ensemble des 89 antennes départementales à descendre dans la rue pour dénoncer le racket du CT2M et réclamer un vrai plan national pour l’état des chaussées et la formation routière.',
    source: 'FFMC Nationale',
    sourceUrl: 'https://ffmc.asso.fr/manif-nationale-octobre-2026',
    category: 'manif',
    geographicalScope: 'France',
    announcementType: 'Mobilisation & Manif',
    impactLevel: 'fort',
    publishedAt: '2026-09-26T18:00:00Z',
    searchDate: '2026-09-28T03:30:00Z',
    hash: 'hash-ffmc-appel-manif-17octobre',
    keyPoints: [
      'Date retenue : Samedi 17 octobre 2026',
      'Rassemblements coordonnés dans toutes les préfectures de France',
      'FFMC 06 coordonnera un cortège Nice - Cannes - Antibes',
    ],
    bookmarked: false,
  },
  {
    id: 'nws-304',
    title: 'Sécurité Routière : Bilan semestriel de l’accidentalité 2RM en région PACA',
    summary: 'Le baromètre ONISR montre une légère baisse des accidents mortels en agglomération niçoise, mais une surreprésentation des chutes isolées liées aux défauts de voirie et bandes glissantes sur route de montagne.',
    source: 'Sécurité Routière',
    sourceUrl: 'https://securite-routiere.gouv.fr/bilan-paca-2026-s1',
    category: 'securite_routiere',
    geographicalScope: 'Région Sud',
    announcementType: 'Recherche & Baromètre',
    impactLevel: 'moyen',
    publishedAt: '2026-09-24T10:30:00Z',
    searchDate: '2026-09-28T03:30:00Z',
    hash: 'hash-securite-routiere-onisr-paca',
    keyPoints: [
      '38% des chutes 2RM hors agglo liées à l’état de la chaussée (gravillons, nids-de-poule)',
      'Preuve statistique à brandir devant le Conseil Départemental 06',
    ],
    bookmarked: false,
  },
  {
    id: 'nws-305',
    title: 'DDTM 06 : Travaux de sécurisation et réfection de chaussée dans les Gorges de la Mescla (RD6202)',
    summary: 'Fermetures nocturnes et alternats prévus du 5 au 16 octobre entre Touët-sur-Var et Malaussène pour purge de falaise et renouvellement du tapis d’enrobé.',
    source: 'DDTM 06',
    sourceUrl: 'https://inforoutes06.fr/travaux-mescla-octobre',
    category: 'infrastructure_06',
    geographicalScope: '06 - Alpes-Maritimes',
    announcementType: 'Infrastructure & Sécurité',
    impactLevel: 'moyen',
    publishedAt: '2026-09-27T16:00:00Z',
    searchDate: '2026-09-28T03:30:00Z',
    hash: 'hash-ddtm06-travaux-mescla-rd6202',
    keyPoints: [
      'Circulation alternée avec gravillons résiduels possibles',
      'Message de vigilance motard à relayer sur nos réseaux',
    ],
    bookmarked: false,
  },
];

export const INITIAL_CA_SHARES: CAShare[] = [
  {
    id: 'sha-001',
    title: 'Note de cadrage : Stratégie de mobilisation et recours juridique contre la ZFE Métropole Nice',
    content: `Chers membres du CA,\n\nVoici la synthèse validée par le bureau pour notre plan d'action automne 2026.\n\n1. État des lieux juridique :\nL'arrêté métropolitain prévoyant des portiques LAPI d'ici fin d'année ne prévoit aucune dérogation explicite pour les deux-roues motorisés de plus de 15 ans. Nous préparons un recours gracieux auprès de Christian Estrosi.\n\n2. Mobilisation de terrain :\nUne journée d'action coordonnée avec la FFMC 83 et la FFMC 13 aura lieu le samedi 17 octobre avec cortège littoral.\n\n3. Communication grand public :\nUn communiqué de presse a été adressé à Nice-Matin et BFM Nice Côte d'Azur.\n\nMerci de faire remonter vos disponibilités pour la commission de concertation du 8 octobre.`,
    category: 'note_de_synthese',
    publishedAt: '2026-09-27T18:00:00Z',
    author: 'Antoine F. (Coordinateur)',
    status: 'active',
    sourceType: 'meeting',
    sourceId: 'mtg-201',
    sourceTitle: 'Réunion mensuelle du Bureau FFMC 06',
  },
  {
    id: 'sha-002',
    title: 'Signalement d’urgence et mise en demeure transmise : Séparateur béton RM6202 (Plan du Var)',
    content: `Point d'information sécurité routière pour le CA :\n\nSuite au signalement d'un adhérent concernant des blocs GBA non éclairés ni balisés sur la 202 bis après le rond-point des Iscles, la commission voirie a immédiatement déposé une mise en demeure auprès de l'astreinte voirie de la Métropole NCA et de la Subdivision de la Tinée.\n\nUne visite sur site de contrôle est programmée ce mardi. Tout membre du CA constatant d'autres anomalies sur cet itinéraire est invité à compléter la fiche voirie.`,
    category: 'courrier_valide',
    publishedAt: '2026-09-28T01:30:00Z',
    author: 'Jean-Marc D. (Commission Voirie)',
    status: 'active',
    sourceType: 'email',
    sourceId: 'eml-101',
    sourceTitle: 'DANGER MORTEL : Plot béton non signalé sur RM6202 vers Plan du Var',
  },
  {
    id: 'sha-003',
    title: 'Compte-rendu des délibérations du Bureau — Session du 26 septembre 2026',
    content: `Relevé des décisions prises à l'unanimité des présents :\n- Quitus financier accordé à la trésorière pour les dépenses estivales.\n- Commande validée de 200 gilets réfléchissants FFMC 06 et de 2 banderoles pour les cortèges.\n- Désignation de la délégation officielle (Antoine et Jean-Marc) pour la concertation mobilités Métropole du 8 octobre.\n- Date de l'Assemblée Générale 2026 fixée au samedi 14 novembre à Levens.`,
    category: 'decision_reunion',
    publishedAt: '2026-09-27T09:00:00Z',
    author: 'Bureau FFMC 06',
    status: 'active',
    sourceType: 'meeting',
    sourceId: 'mtg-201',
    sourceTitle: 'Réunion mensuelle du Bureau FFMC 06',
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-201',
    title: 'Réunion mensuelle du Bureau FFMC 06',
    type: 'bureau',
    date: '2026-09-26T18:30:00Z',
    location: 'Maison des Associations Garibaldi, Nice',
    status: 'completed',
    attendees: ['Antoine F.', 'Jean-Marc D.', 'Sophie M.', 'Marc D.', 'David P.'],
    agenda: [
      'Bilan financier de l’été et renouvellement des adhésions',
      'Opérations de contrôle CT2M Nice Nord et saisine préfecture',
      'Préparation de la manifestation interdépartementale du 17 octobre',
      'Revue des signalements voirie urgents (RM6202, Turini)',
    ],
    summary: 'Séance productive. Accord unanime pour durcir le ton face à la Métropole sur les contrôles CT2M. La commission voirie présentera son rapport semestriel. Validation du budget pour commander 200 nouveaux gilets et banderoles FFMC 06.',
    extractedTaskIds: ['tsk-002', 'tsk-007'],
  },
  {
    id: 'mtg-202',
    title: 'Concertation Mobilités & 2RM avec la Métropole Nice Côte d’Azur',
    type: 'reunion_partenaires',
    date: '2026-10-08T14:30:00Z',
    location: 'Hôtel de Métropole, Salle Plaza, Nice',
    status: 'scheduled',
    attendees: ['Antoine F.', 'Jean-Marc D.', 'M. le Directeur des Transports NCA', 'Représentants Police Municipale'],
    agenda: [
      'Bilan de l’accès des 2RM aux couloirs de bus Gambetta / Californie',
      'Extension demandée sur la voie Mathis',
      'Stationnement 2RM et gratuité',
      'Aménagements des ronds-points glissants',
    ],
    summary: 'Objectif : obtenir l’arrêté définitif pérennisant les couloirs de bus et un engagement écrit sur le doublement des glissières dans la descente de Bellet.',
  },
  {
    id: 'mtg-203',
    title: 'Assemblée Générale Ordinaire 2026 FFMC 06',
    type: 'ag',
    date: '2026-11-14T09:30:00Z',
    location: 'Salle Polyvalente Levens',
    status: 'scheduled',
    attendees: ['Tous les adhérents FFMC 06', 'Membres sympathisants', 'Délégation FFMC 83'],
    agenda: [
      'Rapport moral du coordinateur départemental',
      'Rapport financier et quitus de la trésorière',
      'Bilan des interventions voirie et sauvetage d’infrastructures',
      'Élection du nouveau Conseil d’Administration',
      'Repas motard et tombola solidaire',
    ],
  },
];

export const INITIAL_CRON_CONFIG: CronConfig = {
  enabled: true,
  intervalMinutes: 15,
  lastRunAt: '2026-09-28T03:45:00Z',
  nextRunAt: '2026-09-28T04:00:00Z',
  isRunning: false,
  autoExtractTasks: true,
  gmailActive: true,
  rssActive: true,
};

export const INITIAL_CRON_LOGS: CronLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-28T03:45:12Z',
    source: 'gmail',
    status: 'success',
    message: 'Relève Gmail terminée : 3 messages scannés, 1 nouveau message classé en P0 (Plot béton RM6202)',
    itemsProcessed: 3,
    tasksCreated: 1,
    durationMs: 1420,
  },
  {
    id: 'log-002',
    timestamp: '2026-09-28T03:30:05Z',
    source: 'rss',
    status: 'success',
    message: 'Scraping RSS Légifrance & Métropole NCA : 5 flux inspectés, 2 doublons fusionnés',
    itemsProcessed: 7,
    tasksCreated: 0,
    durationMs: 890,
  },
  {
    id: 'log-003',
    timestamp: '2026-09-28T03:15:00Z',
    source: 'system',
    status: 'success',
    message: 'Synchronisation automatique globale : base de données à jour, zéro conflit RLS',
    itemsProcessed: 0,
    tasksCreated: 0,
    durationMs: 310,
  },
  {
    id: 'log-004',
    timestamp: '2026-09-28T02:45:00Z',
    source: 'gmail',
    status: 'success',
    message: 'Relève Gmail terminée : Aucun nouveau message non lu',
    itemsProcessed: 0,
    tasksCreated: 0,
    durationMs: 540,
  },
];

export const INITIAL_MORNING_BRIEF: MorningBriefing = {
  date: '2026-09-28',
  summary: `Bonjour à l'équipe FFMC 06 ! En ce lundi matin, priorité absolue au signalement de danger mortel sur la RM6202 (séparateur béton sans balisage vers Plan-du-Var) où une mise en demeure d'astreinte doit partir avant 10h. 

Sur le front juridique et médiatique, le dossier ZFE Nice s'accélère avec la parution de l'arrêté métropolitain LAPI : Nice-Matin attend notre réaction officielle d'ici demain midi. Pensez également à valider les 2 projets de réponses rédigés par l'assistant IA avant midi.`,
  urgenciesCount: 2,
  dueTasksCount: 3,
  keyNewsHighlights: [
    'Danger immédiat RM6202 : muret béton non rétro-éclairé (commission voirie mobilisée)',
    'ZFE Nice : Portiques LAPI confirmés pour la fin d’année, réplique médiatique à finaliser',
    'Manif nationale 17 octobre : coordination lancée avec les antennes régionales (Var, Bouches-du-Rhône)',
  ],
  weatherMountainPasses: [
    {
      col: 'Col de Turini (1604m)',
      altitude: '1604m',
      status: 'Ouvert',
      details: 'Chauffée sèche. Attention résidus de gravillons fins sur le versant La Bollène.',
    },
    {
      col: 'Col de la Bonette (2715m)',
      altitude: '2715m',
      status: 'Délicat',
      details: 'Température matinale proche de 2°C, risque de verglas localisé dans les combes ombragées.',
    },
    {
      col: 'Col de Braus (1002m)',
      altitude: '1002m',
      status: 'Ouvert',
      details: 'Bonnes conditions de circulation, lacets dégagés.',
    },
    {
      col: 'Gorges de Daluis / Cians',
      altitude: '900m',
      status: 'Travaux',
      details: 'Alternat feux tricolores au km 14 suite à éboulement de schiste rouge la semaine dernière.',
    },
  ],
};

export const INITIAL_CA_MEMBERS = [
  {
    id: 'usr-antoine',
    name: 'Antoine Fabre',
    email: 'antoinefabre1909@gmail.com',
    role: 'coordinateur' as const,
    title: 'Coordinateur Général FFMC 06',
    avatarColor: 'bg-red-700 text-white',
    phone: '06 12 34 56 78',
    password: '123456',
  },
  {
    id: 'usr-antoine-membre',
    name: 'Antoine Fabre',
    email: 'compteepicgamesantoine@gmail.com',
    role: 'membre' as const,
    title: 'Membre du Conseil d\'Administration FFMC 06',
    avatarColor: 'bg-indigo-600 text-white',
    phone: '06 12 34 56 78',
    password: '456789',
  },
  {
    id: 'usr-coordinateur',
    name: 'Antoine Fabre',
    email: 'coordinateur.ffmc06@gmail.com',
    role: 'coordinateur' as const,
    title: 'Coordinateur Général FFMC 06',
    avatarColor: 'bg-red-700 text-white',
    phone: '06 12 34 56 78',
    password: '123456',
  },
  {
    id: 'usr-jeanmarc',
    name: 'Jean-Marc',
    email: 'voirie.ffmc06@gmail.com',
    role: 'membre' as const,
    title: 'Référent Commission Voirie & Sécurité',
    avatarColor: 'bg-blue-600 text-white',
    phone: '06 98 76 54 32',
    password: 'Voirie-06-Securite',
  },
  {
    id: 'usr-sophie',
    name: 'Sophie',
    email: 'tresorerie.ffmc06@gmail.com',
    role: 'membre' as const,
    title: 'Trésorière & Gestion des Adhésions',
    avatarColor: 'bg-emerald-600 text-white',
    phone: '06 45 67 89 01',
    password: 'Tresor-FFMC-06',
  },
  {
    id: 'usr-david',
    name: 'David',
    email: 'communication.ffmc06@gmail.com',
    role: 'membre' as const,
    title: 'Communication & Réseaux Sociaux',
    avatarColor: 'bg-purple-600 text-white',
    phone: '06 23 45 67 89',
    password: 'Com-Motard-06',
  },
  {
    id: 'usr-pierre',
    name: 'Pierre',
    email: 'relais.ffmc06@gmail.com',
    role: 'membre' as const,
    title: 'Événements & Relais Motards',
    avatarColor: 'bg-amber-600 text-white',
    phone: '06 34 56 78 90',
    password: 'Relais-Calern-06',
  },
  {
    id: 'usr-helene',
    name: 'Hélène',
    email: 'secretariat.ffmc06@gmail.com',
    role: 'membre' as const,
    title: 'Secrétariat & Relations Adhérents',
    avatarColor: 'bg-teal-600 text-white',
    phone: '06 56 78 90 12',
    password: 'Secretariat-06-Adh',
  },
];
