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

Cette étape prépare **uniquement la connexion**. L’import des mails, les analyses IA,
les tâches planifiées et l’envoi de réponses ne sont pas encore implémentés.
Le fonctionnement réel OAuth doit être testé après ajout du secret et consentement Google.
