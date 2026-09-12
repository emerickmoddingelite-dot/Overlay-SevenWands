# SevenWands FA — Overlay Manager

Plateforme SaaS Next.js pour administrer les overlays OBS SevenWands FA.

## Architecture

Une seule application Next.js sert le dashboard, l'API et les overlays publics :

- `dashboard.sevenwands.fr` → interface privée
- `overlay.sevenwands.fr/p/{profileSlug}/{overlay}` → Browser Sources OBS
- `dashboard.sevenwands.fr/api/...` → API

Les deux domaines peuvent pointer vers le même projet Vercel. Le domaine n'est pas codé en dur : `NEXT_PUBLIC_DASHBOARD_URL` et `NEXT_PUBLIC_OVERLAY_URL` pilotent les URLs générées.

Le choix "monorepo séparé dashboard/overlay" n'est pas nécessaire ici : les overlays sont ultra-légers côté client et partagent la même API et le même modèle de données. Cela réduit les duplications et simplifie le déploiement serverless.

## Stack

- Next.js 16 / App Router
- React 19
- TypeScript strict
- Tailwind CSS
- Auth.js + Discord OAuth2
- MariaDB
- Prisma ORM
- Vercel

Les versions doivent être maintenues sur les derniers correctifs disponibles avant une mise en production. Next.js a publié plusieurs correctifs de sécurité en 2026 ; ne déployez jamais une version vulnérable. Voir les notes officielles.

## Installation locale

Prérequis : Node.js 20.19+ (ou une version LTS plus récente).

```bash
npm install
cp .env.example .env
npx auth secret
npm run db:migrate
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Discord OAuth2

Dans Discord Developer Portal :

1. Créer une application.
2. OAuth2 → General.
3. Ajouter le redirect URI :
   `http://localhost:3000/api/auth/callback/discord`
4. En production :
   `https://dashboard.sevenwands.fr/api/auth/callback/discord`
5. Renseigner `AUTH_DISCORD_ID` et `AUTH_DISCORD_SECRET`.
6. Scopes utilisés : `identify email`.

Ne jamais mettre le client secret dans le navigateur, GitHub ou `NEXT_PUBLIC_*`.

## MariaDB

Le projet utilise Prisma 7 avec le driver `@prisma/adapter-mariadb`. MariaDB est utilisé via le connecteur Prisma `mysql`.

Créer une base MariaDB puis renseigner :

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/sevenwands"
```

Le script `scripts/mariadb-init.sql` peut être utilisé pour créer la base initiale. Ensuite :

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Pour une base serverless, utiliser un fournisseur avec pooling/connection management adapté à Vercel.

## Prisma

```bash
npm run db:migrate
npm run db:generate
```

Production :

```bash
npm run db:deploy
```

Le script `postinstall` exécute également `prisma generate`.

## Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Ajouter toutes les variables de `.env.example`.
3. Configurer `AUTH_URL=https://dashboard.sevenwands.fr`.
4. Ajouter les deux domaines :
   - `dashboard.sevenwands.fr`
   - `overlay.sevenwands.fr`
5. Déployer.
6. Appliquer les migrations de production avec `npm run db:deploy` dans le pipeline prévu à cet effet.

## DNS

Créer les enregistrements recommandés par Vercel pour les deux sous-domaines. Ne pas hardcoder une IP : Vercel fournit la cible exacte selon le projet.

## OBS

Pour chaque Browser Source :

- URL : `https://overlay.sevenwands.fr/p/SLUG/starting`
- Dimensions : `1920 × 1080`
- Pour INGAME/TALKING, placer les sources Gameplay/Webcam/Chat sous l'overlay si nécessaire.
- Activer la transparence de la Browser Source.

Les URL disponibles sont :

```text
/p/{slug}/starting
/p/{slug}/ingame
/p/{slug}/brbr
/p/{slug}/talking
/p/{slug}/ending
```

## Compatibilité legacy

Le pack HTML original reste conservé sous `public/legacy/`. La nouvelle plateforme ne supprime pas le principe de `config.js`, et `lib/config/default-config.ts` devient la source de vérité typée pour les nouveaux profils.

Les anciens fichiers peuvent continuer à être utilisés comme installation locale indépendante.

## Sécurité

- Les API privées vérifient systématiquement la session.
- Chaque profil est chargé avec `userId`.
- Un ID ou slug d'un autre compte ne permet pas de modifier sa configuration.
- Les données de configuration sont validées par Zod côté serveur.
- Les configurations publiques sont volontairement en lecture seule.
- Aucun secret n'est exposé au client.
- Les réponses API publiques sont cacheables très brièvement pour limiter la charge OBS.

## Checklist production

- [ ] `AUTH_SECRET` aléatoire
- [ ] OAuth Discord production configuré
- [ ] `DATABASE_URL` de production configurée
- [ ] migrations appliquées
- [ ] `NEXT_PUBLIC_DASHBOARD_URL` correcte
- [ ] `NEXT_PUBLIC_OVERLAY_URL` correcte
- [ ] domaines Vercel vérifiés
- [ ] DNS vérifié
- [ ] Browser Source 1920×1080 testée
- [ ] fallback legacy conservé
- [ ] logs Vercel contrôlés
- [ ] dépendances mises à jour et auditées

## Parrainage

La section **Parrainage** permet de créer plusieurs codes et d'indiquer le propriétaire de chaque code. Chaque alerte **Follow / Subscriber / Donation / Cheer** peut être activée ou désactivée pour le parrainage et reliée à un code précis.

Dans les textes de la section **Alertes**, les variables suivantes sont disponibles :

- `{code}` → code de parrainage sélectionné pour l'alerte
- `{owner}` → propriétaire du code sélectionné

Exemple : `Merci pour ton follow ! Code : {code} • Parrain : {owner}`

Le code sélectionné est résolu côté overlay à partir de la configuration du profil. Aucun changement de schéma MariaDB n'est nécessaire : les données de parrainage sont stockées dans la configuration JSON du profil.


## Parrainage & codes boutique
Chaque code Parrainage peut avoir plusieurs codes Boutique liés. Un code boutique possède son propre état actif/inactif. Les codes boutique actifs sont affichés directement sous le code Parrainage dans les overlays In Game, Starting, BRBR et Ending. Si aucun code n'est configuré, aucun bloc n'est rendu. Dans les textes d'alertes, les variables `{code}`, `{owner}`, `{shopCode}` (premier code boutique actif) et `{shopCodes}` (tous les codes boutique actifs séparés par des virgules) sont disponibles.
