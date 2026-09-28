export type MailCategory =
  | 'danger_voirie_infrastructure'
  | 'contact_institutionnel'
  | 'adhesion_sympathisant'
  | 'reclamation_adherent'
  | 'manif_evenement'
  | 'presse_media'
  | 'reunion_bureau'
  | 'spam_hors_sujet';

export interface MailCategoryMeta {
  id: MailCategory;
  label: string;
  description: string;
  badgeColor: string;
  textColor: string;
  iconName: string;
  defaultAssignee: string;
  slaHours: number;
}

export const MAIL_TAXONOMY: Record<MailCategory, MailCategoryMeta> = {
  danger_voirie_infrastructure: {
    id: 'danger_voirie_infrastructure',
    label: 'Danger / Voirie 06',
    description: 'Signalements nids-de-poule, glissières guillotine, gravillons, peintures glissantes, aménagements dangereux RM / CD06.',
    badgeColor: 'bg-red-500/10 border-red-500/30 text-red-400',
    textColor: 'text-red-400',
    iconName: 'AlertTriangle',
    defaultAssignee: 'Jean-Marc (Commission Voirie)',
    slaHours: 24,
  },
  contact_institutionnel: {
    id: 'contact_institutionnel',
    label: 'Institutionnel',
    description: 'Courriers Mairie de Nice, Métropole NCA, Préfecture 06, DDTM, forces de l’ordre.',
    badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    textColor: 'text-purple-400',
    iconName: 'Landmark',
    defaultAssignee: 'Antoine (Coordinateur)',
    slaHours: 48,
  },
  adhesion_sympathisant: {
    id: 'adhesion_sympathisant',
    label: 'Adhésion / Sympathisant',
    description: 'Demandes d’adhésion, renouvellements, commandes stickers/écusson FFMC, nouveaux motards.',
    badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    textColor: 'text-emerald-400',
    iconName: 'UserCheck',
    defaultAssignee: 'Sophie (Trésorière/Adhésions)',
    slaHours: 72,
  },
  reclamation_adherent: {
    id: 'reclamation_adherent',
    label: 'Suivi / Aide Adhérent',
    description: 'Litiges PV injustifiés, dénonciations CT2M, questions juridiques et recours.',
    badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    textColor: 'text-blue-400',
    iconName: 'ShieldAlert',
    defaultAssignee: 'Antoine (Coordinateur)',
    slaHours: 48,
  },
  manif_evenement: {
    id: 'manif_evenement',
    label: 'Action / Manifestation',
    description: 'Organisation rassemblements, convois, relais calmos, balades de sensibilisation, AG.',
    badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    textColor: 'text-amber-400',
    iconName: 'Megaphone',
    defaultAssignee: 'Bureau FFMC 06',
    slaHours: 48,
  },
  presse_media: {
    id: 'presse_media',
    label: 'Presse & Médias',
    description: 'Demandes d’interviews Nice-Matin, BFM Nice Côte d’Azur, France 3 PACA, communiqués.',
    badgeColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    textColor: 'text-cyan-400',
    iconName: 'Mic',
    defaultAssignee: 'Marc (Relations Presse)',
    slaHours: 12,
  },
  reunion_bureau: {
    id: 'reunion_bureau',
    label: 'Réunion & Bureau',
    description: 'Ordres du jour, convocations, comptes-rendus internes, coordination nationale FFMC.',
    badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    textColor: 'text-indigo-400',
    iconName: 'Users',
    defaultAssignee: 'Bureau FFMC 06',
    slaHours: 72,
  },
  spam_hors_sujet: {
    id: 'spam_hors_sujet',
    label: 'Hors sujet / Pub',
    description: 'Démarchages commerciaux, spams ou messages non pertinents pour l’antenne.',
    badgeColor: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
    textColor: 'text-zinc-400',
    iconName: 'Inbox',
    defaultAssignee: 'Système',
    slaHours: 168,
  },
};
