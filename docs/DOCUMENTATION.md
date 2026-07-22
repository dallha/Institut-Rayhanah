# 📚 Documentation Technique — Institut Rayhanah ERP
> Système de gestion intégré pour daara coranique (Scolarité · Pédagogie · Comptabilité · RH)

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Stack technologique](#3-stack-technologique)
4. [Structure des fichiers](#4-structure-des-fichiers)
5. [Base de données — Modèles Prisma](#5-base-de-données--modèles-prisma)
6. [API Backend — Routes Express](#6-api-backend--routes-express)
7. [Modules Frontend](#7-modules-frontend)
8. [Authentification Supabase](#8-authentification-supabase)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Guide d'installation (développement)](#10-guide-dinstallation-développement)
11. [Guide de déploiement (production)](#11-guide-de-déploiement-production)
12. [Données métier et énumérations](#12-données-métier-et-énumérations)
13. [Import / Export CSV](#13-import--export-csv)
14. [Fonctionnalités pédagogiques coraniques](#14-fonctionnalités-pédagogiques-coraniques)
15. [Glossaire](#15-glossaire)

---

## 1. Vue d'ensemble du projet

**Institut Rayhanah ERP** est un logiciel de gestion tout-en-un (SaaS) conçu spécifiquement pour les établissements d'enseignement coranique (daara). Il couvre 5 espaces fonctionnels distincts :

| Espace | Rôle |
|--------|------|
| 🏠 **Pilotage** | Tableau de bord général — statistiques en temps réel |
| 📚 **Scolarité** | Inscriptions, liste des élèves, trésorerie |
| 🕌 **Pédagogie** | Suivi coranique, cahier d'appel, bulletins, graphiques |
| 🏆 **Honneur** | Tableau d'honneur des Huffaz et mémorisants |
| ⚙️ **Admin / RH** | Paramètres, import/export, gestion du système |

> **Repository GitHub :** https://github.com/dallha/Institut-Rayhanah  
> **Base de données :** Supabase PostgreSQL (`eu-west-1`, Irlande)  
> **Référence projet Supabase :** `jaudxdtcsqezwfnuohks`

---

## 2. Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│         React 19 + Vite 6 + TailwindCSS 4 + Motion         │
│                    Port 3000 (dev)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / REST (fetch)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│             Node.js + TypeScript + tsx watch                │
│                    Port 3001 (dev)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma Client + @prisma/adapter-pg
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE POSTGRESQL                        │
│    aws-0-eu-west-1.pooler.supabase.com:5432                 │
│         Project: jaudxdtcsqezwfnuohks                       │
└─────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┘
         │ Supabase Auth
         ▼
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTIFICATION (Supabase Auth)               │
│        Email + Mot de passe · Session JWT persistante       │
│            @supabase/supabase-js v2                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Stack technologique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.0.1 | Framework UI |
| TypeScript | ~5.8.2 | Typage statique |
| Vite | 6.2.3 | Bundler / Dev server |
| TailwindCSS | 4.1.14 | Styles utilitaires |
| Motion (Framer) | 12.x | Animations fluides |
| Lucide React | 0.546.0 | Bibliothèque d'icônes |
| Recharts | 3.10.0 | Graphiques (stats hebdo) |
| PapaParse | 5.5.4 | Import/Export CSV |
| @supabase/supabase-js | 2.110.8 | Auth Supabase côté client |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 26.x | Runtime |
| Express | 4.21.2 | Framework HTTP |
| Prisma ORM | 7.9.0 | Accès base de données |
| @prisma/adapter-pg | 7.9.0 | Adaptateur PostgreSQL |
| pg | 8.22.0 | Driver PostgreSQL natif |
| dotenv | 17.2.3 | Variables d'environnement |
| tsx | 4.21.0 | Exécution TypeScript natif |

### Infrastructure
| Service | Usage |
|---------|-------|
| **Supabase** | Base de données PostgreSQL + Authentification |
| **GitHub** | Versionnement du code source |

---

## 4. Structure des fichiers

```
Institut Rayhanah/
├── 📁 prisma/
│   ├── schema.prisma         # Modèles de base de données
│   └── seed.ts               # Données de démo initiales
├── 📁 src/
│   ├── 📁 components/
│   │   ├── AttendanceTab.tsx     # Cahier d'appel quotidien
│   │   ├── ComptabiliteTab.tsx   # Trésorerie / paiements
│   │   ├── DesignerModal.tsx     # Modal crédit graphiste
│   │   ├── HonneurTab.tsx        # Tableau d'honneur
│   │   ├── InscriptionTab.tsx    # Liste et inscriptions élèves
│   │   ├── KashfShahriTab.tsx    # Bulletins mensuels (كشف شهري)
│   │   ├── MotivationTab.tsx     # Gamification / badges
│   │   ├── ParametresTab.tsx     # Admin/RH — paramètres & import
│   │   ├── PedagogieModule.tsx   # Navigation module pédagogie
│   │   ├── PedagogyTab.tsx       # Suivi coranique (dars)
│   │   ├── PilotageTab.tsx       # Dashboard principal
│   │   ├── ScolariteModule.tsx   # Navigation module scolarité
│   │   └── WeeklySummaryChart.tsx # Graphique stats hebdomadaires
│   ├── 📁 lib/
│   │   └── supabase.ts           # Client Supabase (singleton)
│   ├── App.tsx               # Composant racine + navigation + auth
│   ├── index.css             # Styles globaux
│   ├── main.tsx              # Point d'entrée React
│   ├── mockData.ts           # Données de démonstration + helpers
│   ├── quranData.ts          # Données statiques du Coran (114 sourates)
│   └── types.ts              # Interfaces TypeScript globales
├── 📁 scripts/
│   └── create-admin.ts       # Script création utilisateur Supabase
├── 📁 docs/
│   └── DOCUMENTATION.md      # Ce fichier
├── 📁 public/
│   └── logo.png              # Logo de l'Institut Rayhanah
├── server.ts                 # Serveur API Express
├── prisma.config.ts          # Configuration Prisma
├── vite.config.ts            # Configuration Vite
├── tsconfig.json             # Configuration TypeScript
├── package.json              # Dépendances npm
├── .env                      # Variables d'environnement (NON commité)
├── .env.example              # Modèle de variables d'environnement
├── .gitignore                # Fichiers ignorés par Git
└── README.md                 # Documentation non-technique
```

---

## 5. Base de données — Modèles Prisma

### `Student` — Élève

```prisma
model Student {
  id                  String    @id @default(uuid())
  matricule           String    @unique
  firstName           String
  lastName            String
  parentName          String
  parentPhone         String
  parentEmail         String?
  halaqaId            String
  halaqa              Halaqa    @relation(...)
  etape               String    // Enum: EtapePedagogique

  // Progression coranique
  currentSurahNum     Int?      // Numéro de la sourate actuelle (1-114)
  currentVersetNum    Int?      // Verset actuel
  currentHizbNum      Int?      // Numéro du hizb actuel (1-60)
  currentHizbFraction Float?    // 0 | 0.25 | 0.5 | 0.75 | 1.0

  // Statistiques & Gamification
  khatmatCount        Int       @default(0)
  dailyWardHizbs      Int       @default(0)
  score               Int       @default(0)

  // Comptabilité
  balanceDue          Float     @default(0) // En FCFA
  monthlyFee          Float     @default(0)
  age                 Int?
  regime              String?   // "internat" | "externat" | "demi-pension"

  medals              StudentMedal[]
  lessons             QuranLesson[]
  attendance          AttendanceRecord[]
  payments            PaymentRecord[]
}
```

### `Halaqa` — Groupe / Classe

```prisma
model Halaqa {
  id          String    @id @default(uuid())
  name        String
  teacherName String
  maxCapacity Int       @default(20)
  students    Student[]
}
```

### `QuranLesson` — Dars (Leçon Coranique)

```prisma
model QuranLesson {
  id                String  @id @default(uuid())
  studentId         String
  date              String  // YYYY-MM-DD
  evaluation        String  // "Naam" (نعم) | "Lam" (لم)
  type              String  // "sourate" | "hizb"

  // Mode Sourate
  startSurah        Int?
  startVerset       Int?
  endSurah          Int?
  endVerset         Int?

  // Mode Hizb
  startHizb         Int?
  startHizbFraction Float?
  endHizb           Int?
  endHizbFraction   Float?
}
```

### `AttendanceRecord` — Présence

```prisma
model AttendanceRecord {
  id        String  @id @default(uuid())
  studentId String
  date      String  // YYYY-MM-DD
  status    String  // "Present" | "Absent" | "Late"
}
```

### `PaymentRecord` — Paiement

```prisma
model PaymentRecord {
  id            String  @id @default(uuid())
  studentId     String
  date          String
  amount        Float
  purpose       String  // Ex: "Mensualité Juillet 2026"
  receiptNumber String
  recordedBy    String
}
```

### `StudentMedal` — Médaille / Badge

```prisma
model StudentMedal {
  id        String   @id @default(uuid())
  studentId String
  name      String
  icon      String   // Emoji ou code icône
  date      String
}
```

---

## 6. API Backend — Routes Express

**Base URL (dev) :** `http://localhost:3001`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Vérification état du serveur |
| `GET` | `/api/students` | Liste tous les élèves (avec médailles) |
| `POST` | `/api/students` | Créer un nouvel élève |
| `PUT` | `/api/students/:id` | Mettre à jour un élève (avec médailles) |
| `POST` | `/api/students/import` | Import batch CSV (upsert) |
| `GET` | `/api/halaqas` | Liste toutes les halaqas |
| `GET` | `/api/attendance` | Liste tous les enregistrements de présence |
| `GET` | `/api/lessons` | Liste toutes les leçons coraniques |
| `GET` | `/api/payments` | Liste tous les paiements |
| `POST` | `/api/payments` | Enregistrer un nouveau paiement |
| `POST` | `/api/cloture-day` | **Transaction atomique** : clôture la journée pédagogique |

### Exemple — Clôture journée (`POST /api/cloture-day`)

```json
{
  "attendanceRecords": [
    { "id": "...", "studentId": "...", "date": "2026-07-22", "status": "Present" }
  ],
  "newLessons": [
    { "id": "...", "studentId": "...", "date": "2026-07-22", "evaluation": "Naam", "type": "hizb", "startHizb": 5, "endHizb": 5 }
  ],
  "updatedStudents": [
    { "id": "...", "currentHizbNum": 5, "score": 145 }
  ]
}
```

---

## 7. Modules Frontend

### 🏠 Pilotage (`PilotageTab.tsx`)
- Nombre total d'élèves, Huffaz, taux de présence
- Alertes impayés (seuil configurable en FCFA)
- Statistiques par halaqa
- Aperçu des dernières activités

### 📚 Scolarité (`ScolariteModule.tsx`)

**Onglet Inscriptions / Liste (`InscriptionTab.tsx`) :**
- Fiche complète de chaque élève
- Formulaire d'inscription (nom, parent, téléphone, halaqa, régime, étape)
- Filtres par halaqa, étape pédagogique
- Visualisation de la progression coranique (hizb / sourate)

**Onglet Trésorerie (`ComptabiliteTab.tsx`) :**
- Enregistrement des paiements (mensualité, frais d'inscription, etc.)
- Historique des règlements par élève
- Soldes impayés et alertes
- Numéro de reçu automatique

### 🕌 Pédagogie (`PedagogieModule.tsx`)

**Suivi Coranique (`PedagogyTab.tsx`) :**
- Sélection du mode : Sourate ↔ Hizb
- Saisie des dars quotidiens par élève
- Évaluation binaire : **نعم Naam** (Validé) / **لم Lam** (À refaire)
- Attribution automatique des points de score

**Cahier d'Appel (`AttendanceTab.tsx`) :**
- Appel quotidien par halaqa (Présent / Absent / En retard)
- Clôture de journée (transaction atomique)
- Historique de présence avec filtres

**Bulletins Mensuels (`KashfShahriTab.tsx` — كشف شهري) :**
- Relevé mensuel par élève
- Résumé des présences, dars évalués, progression hizb

**Stats Hebdomadaires (`WeeklySummaryChart.tsx`) :**
- Graphique Recharts des évaluations Naam/Lam sur 7 jours
- Comparaison par halaqa

### 🏆 Honneur (`HonneurTab.tsx`)
- **Huffaz certifiés** : élèves au stade `Hafiz`
- **Proches du Khatm** : élèves ayant atteint les Hizbs 50–60
- **Top 5 mémorisants actifs** : classement par score gamifié

### ⚙️ Admin / RH (`ParametresTab.tsx`)
- Nom de l'établissement (modifiable, stocké en localStorage)
- Import CSV d'élèves avec prévisualisation
- Export CSV de tous les élèves
- Paramètre seuil alerte impayés

---

## 8. Authentification Supabase

### Flux d'authentification

```
Utilisateur → Formulaire Login (email + mot de passe)
     ↓
supabase.auth.signInWithPassword({ email, password })
     ↓
Supabase Auth → vérifie les identifiants
     ↓
Session JWT renvoyée → stockée automatiquement (localStorage)
     ↓
onAuthStateChange → App.tsx met à jour l'état `session`
     ↓
L'application se déverrouille (isAppAuthenticated = true)
```

### Client Supabase (`src/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### États d'authentification dans `App.tsx`

| État | Description |
|------|-------------|
| `authLoading = true` | Vérification de la session en cours → spinner |
| `session = null` | Non connecté → affichage du formulaire de login |
| `session ≠ null` | Connecté → accès à l'application complète |

### Fonctions clés

```typescript
// Connexion
await supabase.auth.signInWithPassword({ email, password });

// Déconnexion
await supabase.auth.signOut();

// Écoute des changements de session (persistance au rechargement)
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});
```

### Créer un utilisateur admin

Via le **Dashboard Supabase** :
`Authentication > Users > Add user > Auto Confirm User ✓`

Ou via script (nécessite la `service_role` key) :
```bash
SUPABASE_SERVICE_KEY="..." ADMIN_EMAIL="admin@rayhanah.sn" ADMIN_PASSWORD="..." npx tsx scripts/create-admin.ts
```

---

## 9. Variables d'environnement

### `.env` (racine du projet — ne jamais commiter)

```env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Base de données PostgreSQL (Supabase)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE_URL="postgresql://postgres.PROJET_REF:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.PROJET_REF:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Supabase Auth (Frontend Vite)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE_SUPABASE_URL="https://PROJET_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_..."
```

> ⚠️ Ne jamais commiter `.env` sur GitHub. Il est dans `.gitignore`.

---

## 10. Guide d'installation (développement)

### Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Compte Supabase actif
- Git

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/dallha/Institut-Rayhanah.git
cd Institut-Rayhanah

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# → Remplir DATABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# 4. Pousser le schéma sur la base de données
npx prisma db push

# 5. (Optionnel) Insérer les données de démonstration
npx prisma db seed

# 6. Lancer le backend (terminal 1)
npm run dev:server

# 7. Lancer le frontend (terminal 2)
npm run dev

# → Frontend : http://localhost:3000
# → Backend  : http://localhost:3001
```

---

## 11. Guide de déploiement (production)

### Build frontend

```bash
npm run build
# Génère le dossier dist/ prêt pour déploiement statique
```

### Scripts npm disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre Vite en mode développement (port 3000) |
| `npm run dev:server` | Démarre Express avec hot-reload (port 3001) |
| `npm run build` | Compile le frontend pour la production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie les types TypeScript |
| `npx prisma db push` | Synchronise le schéma avec la DB |
| `npx prisma db seed` | Insère les données de démonstration |
| `npx prisma studio` | Interface graphique de la base de données |

---

## 12. Données métier et énumérations

### `EtapePedagogique` — Étapes du parcours coranique

| Valeur | Arabe | Description |
|--------|-------|-------------|
| `Tahajji` | التهجي | Alphabétisation arabe (débutants) |
| `Hifz` | الحفظ | Mémorisation active du Coran |
| `Murajaah` | المراجعة | Révision des parties mémorisées |
| `Tathbit` | التثبيت | Consolidation et ancrage |
| `Khatm` | الختم | Clôture transitoire (quasi-finalisé) |
| `Hafiz` | حافظ | Mémorisateur certifié du Coran complet |

### `Evaluation` — Évaluation binaire du dars

| Valeur | Arabe | Signification |
|--------|-------|---------------|
| `Naam` | نعم | Validé — le dars est acquis (+30 pts) |
| `Lam` | لم | À refaire — non acquis (+15 pts de participation) |

### `AttendanceStatus` — Statut de présence

| Valeur | Arabe | Description |
|--------|-------|-------------|
| `Present` | حاضر | Présent |
| `Absent` | غائب | Absent |
| `Late` | متأخر | En retard |

### `Regime` — Régime de l'élève

| Valeur | Description |
|--------|-------------|
| `internat` | Pensionnaire (logé et nourri dans l'établissement) |
| `externat` | Externe (rentre chez lui après les cours) |
| `demi-pension` | Mange à l'école mais rentre le soir |

### Progression Hizb — Fractions

| Valeur | Notation arabe | Description |
|--------|---------------|-------------|
| `0` | — | Début du hizb |
| `0.25` | ربع | Quart du hizb |
| `0.5` | نصف | Moitié du hizb |
| `0.75` | ثلاثة أرباع | Trois quarts |
| `1.0` | كامل | Hizb complet |

---

## 13. Import / Export CSV

### Export CSV

Dans **Admin/RH**, le bouton **Exporter CSV** génère :
```
ELEVES_INSTITUT_RAYHANAH_2026-07-22.csv
```

**Colonnes exportées :**
`id, matricule, firstName, lastName, parentName, parentPhone, parentEmail, halaqaId, etape, score, balanceDue, monthlyFee, age, regime`

### Import CSV

**Format attendu :** colonnes séparées par virgules, première ligne = en-têtes.

**Colonnes minimales requises :**
- `matricule` (obligatoire, unique)
- `firstName`, `lastName`
- `parentName`, `parentPhone`
- `halaqaId` (doit correspondre à un ID de halaqa existant)
- `etape` (valeur de l'enum `EtapePedagogique`)

**Comportement :** upsert — si un élève avec le même `id` existe, il est mis à jour ; sinon, il est créé.

**Route API :** `POST /api/students/import`

---

## 14. Fonctionnalités pédagogiques coraniques

### Système de suivi Hizb/Sourate

L'élève peut progresser selon deux axes :
- **Mode Sourate** : de la sourate X verset Y à la sourate X' verset Y'
- **Mode Hizb** : du hizb X fraction F au hizb X' fraction F' (système ouest-africain 60 hizbs)

### Clôture de journée (transaction atomique)

Quand le maître clique **Clôturer la journée** :

1. Les enregistrements de présence sont insérés (`AttendanceRecord`)
2. Les dars sont insérés (`QuranLesson`)
3. Chaque élève présent voit son score et sa progression mis à jour (`Student`)

Le tout s'effectue dans **une seule transaction Prisma** (`$transaction`).

### Système de gamification

| Événement | Points attribués |
|-----------|-----------------|
| Dars évalué `Lam` (participation) | +15 pts |
| Dars évalué `Naam` (validé) | +30 pts |
| Médaille attribuée | +50 pts |

### Tableau d'Honneur

- **Huffaz certifiés** : élèves avec `etape = "Hafiz"`
- **Proches du Khatm** : élèves ayant atteint les hizbs 50–60
- **Top 5 actifs** : les 5 élèves avec le score le plus élevé

---

## 15. Glossaire

| Terme | Définition |
|-------|-----------|
| **Daara** | École coranique traditionnelle (Sénégal / Afrique de l'Ouest) |
| **Halaqa** | Cercle d'étude coranique / classe |
| **Dars** | Leçon journalière coranique |
| **Hizb** | 1/60ème du Coran — système de progression ouest-africain |
| **Ward** | Portion quotidienne de récitation |
| **Khatm / Khatma** | Récitation intégrale du Coran |
| **Huffaz** | Pluriel de Hafiz — mémorisateurs du Coran |
| **Hafiz** | Celui qui a mémorisé l'intégralité du Coran |
| **Murajaah** | Révision des parties mémorisées |
| **Tathbit** | Consolidation de la mémorisation |
| **Tahajji** | Apprentissage de la lecture arabe |
| **كشف شهري** | Bulletin mensuel (kashf shahri) |
| **Internat** | Élève pensionnaire vivant dans l'établissement |
| **FCFA** | Franc CFA — devise utilisée en Afrique de l'Ouest |

---

*Documentation générée le 22 juillet 2026 — Institut Rayhanah ERP v1.0*
