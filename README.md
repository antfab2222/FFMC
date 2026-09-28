# Intranet FFMC 06

## Fonctionnement

- Connexion par compte Supabase autorisé dans `ca_members`. Aucun compte ou code de démonstration.
- Gmail passe par les fonctions `gmail-connect` et `mail-assistant`. La connexion OAuth existante est conservée côté serveur ; les jetons Gmail ne sont pas exposés au navigateur.
- Courriers reçus et envoyés : lecture de `ca_mail_messages`, filtres par catégorie et sujet, classement manuel enregistré, lecture des analyses Gemini existantes.
- Relève par pages de 50 messages, périmètre initial de 30 jours. Le bouton indique si l’import doit être poursuivi. Relève programmée existante : 5 minutes.
- Analyse Gemini par lots de 3, plafond existant de 20 appels par jour. L’état réel des quotas, interruptions et erreurs est affiché. Les pièces jointes ne sont pas analysées.
- Réponses : brouillon modifiable, copie du texte et ouverture du compte Gmail prévu. Aucun envoi automatique et aucun faux statut « envoyé ».
- Veille : `ca_news_items` fournit les sources, dates, analyses et suivis issus des mails. « Actualiser le fil » consulte les flux FFMC et Motomag via `news-feed`, puis enregistre les nouveaux articles sans doublons d’URL. Le texte RSS est un extrait de source, avec classement indicatif, pas une analyse IA. La collecte RSS est manuelle ; la lecture de la base se rafraîchit chaque minute quand le site est ouvert.
- Les données d’exemple préchargées ont été supprimées. Les identifiants exacts des anciennes tâches/réunions/publications de démonstration sont retirés des caches locaux. Les éléments manuels non concernés sont conservés. Les mails et les news privés ne sont plus restaurés depuis localStorage.

## Développement et vérifications

```sh
npm ci
npm run lint
npm test
npm run build
npm run dev
```

Le site statique utilise les fonctions Supabase ; il ne dépend pas de routes Express `/api` absentes de GitHub Pages. `server.ts` sert uniquement le site en développement ou en hébergement Node.

## Déploiement

GitHub Actions publie `dist` avec `PAGES_BASE_PATH=/FFMC/`. `package-lock.json` est versionné.
Les fonctions Gmail existantes et leurs secrets sont conservés. Déployer aussi `supabase/functions/news-feed/index.ts` avec la configuration dans `supabase/config.toml` : authentification du JWT et rôle coordinateur contrôlés dans le gestionnaire.

Les dossiers/actions, réunions et brouillons de partages créés depuis cette interface restent locaux au navigateur ; ce changement raccorde le courrier et la veille à la base existante. Un brouillon de réponse est conservé pendant la session uniquement.
