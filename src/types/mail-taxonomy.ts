export const MAIL_CATEGORIES = [
  "Actualités",
  "Ordres du jour",
  "Comptes rendus",
  "Newsletters",
  "Vie du réseau",
  "Administratif",
  "Notifications et publicité",
  "Correspondance",
] as const;
export type MailCategory = (typeof MAIL_CATEGORIES)[number];
export const MAIL_TOPICS = [
  "CT moto",
  "Manifestations",
  "Balades",
  "Réunions et CA",
  "Partenaires",
  "Administratif",
  "Actualités générales",
  "Politique et réglementation",
  "Circulation et infrastructures",
  "Sécurité routière",
  "Formations et JTI",
  "Relais Motards Calmos",
  "Solidarité",
  "Vie associative",
  "Services et notifications",
  "Autre",
];
export const MAIL_TAXONOMY = Object.fromEntries(
  MAIL_CATEGORIES.map((id) => [
    id,
    {
      id,
      label: id,
      badgeColor:
        "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200",
      defaultAssignee: "À attribuer",
    },
  ]),
);
