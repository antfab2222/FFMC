# Connexion Gmail FFMC06

Boîte autorisée : coordinateur.ffmc06@gmail.com. L’utilisateur Supabase conserve
son compte coordinateur actuel. Cette connexion ne change pas son adresse de connexion.

## Installation serveur

1. Appliquer `gmail-connection.sql` une fois après `roles-and-sharing.sql`.
2. Déployer `functions/gmail-connect/index.ts` et `crypto.ts`, avec `verify_jwt=false`.
   La fonction vérifie elle-même le JWT et le rôle coordinateur pour chaque POST.
   Le retour Google utilise un état aléatoire à usage unique, expirant après 10 minutes.
3. Dans Supabase → Edge Functions → Secrets, ajouter `GOOGLE_CLIENT_SECRET`.
   Valeur : le secret du client OAuth **FFMC06 – Connexion Gmail**.
   Ne pas le placer dans GitHub, un préfixe VITE_, une capture ou un message de chat.
   L’ID client public est déjà configuré dans la fonction.

## Google Cloud

Dans le client OAuth Web, conserver l’origine `https://antfab2222.github.io`.
Ajouter exactement cette URI de redirection autorisée :

```
https://hojiveehwtazeqiymnwg.supabase.co/functions/v1/gmail-connect
```

Activer Gmail API et déclarer le niveau d’accès `https://www.googleapis.com/auth/gmail.readonly`.
Si l’application est en test, ajouter `coordinateur.ffmc06@gmail.com` aux utilisateurs test
(Google Auth Platform → Audience). Respecter les exigences Google applicables avant la mise en production.

Dans l’intranet, ouvrir **Courrier privé → Connecter Gmail**, puis choisir cette boîte
et autoriser la lecture. Une autre boîte est refusée. La connexion n’envoie aucun mail
et ne modifie pas les messages Gmail.

## Protection et limites

Les jetons de renouvellement sont chiffrés avec AES-GCM et une clé dérivée du secret OAuth
via HKDF. Ce secret reste dans les secrets des fonctions, séparé de la base.
Une rotation du secret OAuth nécessite une nouvelle connexion Gmail.
Les deux tables de connexion n’accordent aucun accès à `anon` ou `authenticated`.
Aucun jeton Google ne revient dans le navigateur ni dans les publications au CA.
Pour révoquer l’accès, utiliser les connexions tierces du compte Google.

## Import et analyse privée

Appliquer `mail-assistant.sql` une fois, puis déployer `functions/mail-assistant/index.ts`
avec `content.ts` et `../gmail-connect/crypto.ts`, `verify_jwt=true`.
Le serveur vérifie aussi la session et le rôle coordinateur pour chaque action.

Dans **Courrier privé**, cliquer **Importer les mails**. Le premier import couvre les
30 derniers jours, par pages de 20. Continuer avec **Importer la page suivante** si proposé.
Les imports suivants récupèrent les nouveaux échanges avec un chevauchement d’un jour ;
les identifiants Gmail empêchent les doublons. Les pièces jointes ne sont pas téléchargées.
Le texte conservé est limité à 30 000 caractères par mail ; les extraits tronqués sont signalés.

Pour activer l’IA, ajouter dans Supabase → Edge Functions → Secrets :

- `OPENAI_API_KEY` : une clé du compte API OpenAI disposant de crédit.
- `MAIL_AI_ENABLED` : `true` pour activer explicitement les appels facturables.

Ne jamais mettre la clé dans GitHub, une variable VITE_, une capture ou le chat.
La facturation API est distincte de l’abonnement ChatGPT. Fixer également un budget côté API.
Supprimer le drapeau ou le passer à `false` désactive l’analyse sans bloquer l’import.

Le modèle `gpt-4.1-mini-2025-04-14` reçoit le sujet, l’expéditeur, la date, jusqu’à
12 000 caractères du mail et deux échanges antérieurs importés (2 000 caractères chacun).
Les appels utilisent `store:false`. Le texte des mails est transmis à OpenAI seulement
lorsque l’analyse est activée et lancée. Plafond serveur : 20 tentatives par jour UTC,
y compris les erreurs. Les propositions restent privées et doivent être vérifiées.

Les filtres regroupent les sujets et les actions proposées : À débattre, À répondre,
À partager, Pour information. Préparer un dossier ou un partage ouvre un formulaire
à relire et valider. Aucun mail n’est envoyé, aucune publication n’est automatique.
L’actualisation facultative toutes les cinq minutes fonctionne uniquement lorsque cet
écran reste ouvert ; aucune tâche de fond n’est installée pour le site fermé.

## Vérifications

`npm run build`, `node tests/gmail-security.mjs` et `node tests/mail-content.mjs`.
Tester ensuite avec le coordinateur : import, pagination, absence de doublons, activation
IA et relecture. Vérifier qu’un membre du CA ne peut lire `ca_mail_messages`, même par API.
Les tables de connexion et de consommation IA restent accessibles au serveur seulement.
