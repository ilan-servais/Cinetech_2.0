# Cinetech 2.0

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=flat)

Application web inspirée de TMDB (The Movie Database) permettant d'explorer une vaste collection de films et séries, avec une interface moderne et responsive.

## À propos du projet

Cinetech 2.0 est une application web qui utilise l'API TMDB pour offrir une expérience de navigation fluide à travers les films et séries. L'application permet de consulter les tendances, les films à l'affiche, les séries populaires, d'effectuer des recherches et de gérer une liste de favoris ainsi que des contenus visionnés.

## Stack technique

- **Next.js 14** (App Router) - Framework React moderne avec rendu côté serveur (SSR)
- **TypeScript** (mode strict) - Pour un typage fort et un code plus robuste
- **TailwindCSS** - Framework CSS utility-first pour un développement rapide
- **API TMDB** - Source de données pour les films, séries et artistes
- **PostgreSQL** - Base de données pour stocker les utilisateurs et leurs préférences
- **Prisma** - ORM pour interagir avec la base de données

## Fonctionnalités

- ✅ **Page d'accueil** avec carrousels des tendances, films et séries
- ✅ **Pages détaillées** pour les films et séries
- ✅ **Recherche** de films, séries et personnes
- ✅ **Catégories** : Films populaires, Films à l'affiche, Films les mieux notés, etc.
- ✅ **Pagination** responsive pour naviguer à travers les résultats
- ✅ **Gestion des favoris** avec sauvegarde dans la base de données
- ✅ **Suivi des contenus visionnés** avec marquage "déjà vu"
- ✅ **Liste à voir plus tard** pour marquer les contenus à regarder
- ✅ **Mode responsive** adapté à tous les appareils
- ✅ **Mode sombre** pour une utilisation confortable de nuit
- ✅ **Accessibilité** avec navigation au clavier et attributs ARIA
- ✅ **Loading skeletons** pour améliorer l'UX pendant le chargement
- ✅ **Filtrage intelligent** pour exclure les contenus non pertinents

## Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn
- PostgreSQL

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/cinetech-2.0.git

# Se placer dans le dossier du projet
cd cinetech-2.0/frontend

# Installer les dépendances
npm install

# Copier le fichier d'exemple des variables d'environnement
cp .env.local.example .env.local

# Remplir les variables d'environnement nécessaires dans .env.local
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet frontend et ajoutez les variables suivantes:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

Remplacez `your_api_key_here` par votre clé API TMDB. Vous pouvez obtenir une clé API en créant un compte sur [https://www.themoviedb.org/](https://www.themoviedb.org/)

## Démarrage

Pour démarrer l'application en mode développement:

```bash
npm run dev
```

Cela lancera le serveur de développement et vous pourrez accéder à l'application à l'adresse [http://localhost:3000](http://localhost:3000)

## Déploiement

Pour déployer l'application, vous pouvez utiliser des services comme Vercel, Netlify ou Heroku. Assurez-vous de configurer les variables d'environnement nécessaires sur la plateforme de déploiement choisie.

## Architecture de l'authentification

Cinetech 2.0 implémente une architecture d'authentification moderne et optimisée basée sur les meilleures pratiques React/Next.js.

### Choix architectural : Provider unique au niveau racine

L'authentification est gérée par un **AuthProvider unique** monté dans `app/layout.tsx`, garantissant :
- ✅ Une seule source de vérité pour l'état d'authentification
- ✅ Prévention des fuites mémoire et des états incohérents
- ✅ Performance optimale avec un seul appel d'initialisation

```tsx
// app/layout.tsx
<AuthProvider>
  <ClientLayout>{children}</ClientLayout>
</AuthProvider>
```

### Pattern centralisé avec fetch unique

Le contexte AuthContext centralise **tous** les appels d'authentification :
- 🎯 **Un seul fetch** `/api/auth/me` dans toute l'application
- 🎯 **Pas de duplicatas** dans les composants individuels
- 🎯 **Gestion d'état unifiée** (loading, initialized, user)

```tsx
// contexts/AuthContext.tsx
const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  // Traitement centralisé...
};
```

### Hook useAuth pour tous les composants

Tous les composants utilisent exclusivement le hook `useAuth()` :
- ✅ Accès uniforme à l'état d'authentification
- ✅ Évite les fetches directs dans les composants
- ✅ Type safety avec TypeScript

```tsx
// Dans n'importe quel composant
const { user, loading, initialized, isAuthenticated } = useAuth();

if (!hasMounted || !initialized || loading) {
  return <LoadingSpinner />;
}
```

### Redirection sécurisée

La logique de redirection respecte le cycle de vie Next.js :
1. ⏳ **Attendre le montage côté client** (`hasMounted`)
2. ⏳ **Attendre l'initialisation du contexte** (`initialized`)
3. ⏳ **Attendre la fin du loading** (`!loading`)
4. 🚨 **Rediriger seulement si non authentifié**

```tsx
// Pattern de redirection sécurisée
if (hasMounted && initialized && !loading && !isAuthenticated) {
  router.push('/login');
  return;
}
```

### Composant AuthGuard

Un composant réutilisable `AuthGuard` encapsule cette logique :

```tsx
<AuthGuard fallback={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### Avantages de cette architecture

- 🚀 **Performance** : Un seul appel réseau pour l'authentification
- 🛡️ **Sécurité** : Redirections conditionnelles robustes
- 🧹 **Maintenabilité** : Code DRY avec une logique centralisée
- 🔧 **Debugging** : Logs structurés pour tracer les états
- 💾 **État consistant** : Synchronisation automatique dans toute l'app

### Recommandations pour l'amélioration

Pour étendre ce système, considérez :

1. **Refresh Token automatique** :
```tsx
// Intercepteur pour renouveler le token expiré
const refreshToken = async () => { /* ... */ };
```

2. **Gestion de session avancée** :
```tsx
// Détection d'inactivité et logout automatique
const useSessionTimeout = (minutes: number) => { /* ... */ };
```

3. **Tests End-to-End** :
```typescript
// Cypress/Playwright pour tester les flux d'authentification
cy.login('user@example.com', 'password');
cy.should('be.redirected', '/dashboard');
```

4. **Monitoring et analytics** :
```tsx
// Tracking des événements d'authentification
analytics.track('user_login', { method: 'email' });
```

Cette architecture garantit une base solide et extensible pour l'authentification dans une application Next.js moderne.

## 🔐 Architecture de l'Authentification

Cinetech 2.0 implémente une architecture d'authentification moderne et robuste basée sur React Context et les cookies HTTP-only.

### Choix architecturaux

#### 1. Provider AuthContext unique au niveau racine

L'authentification est gérée par un seul `AuthProvider` monté dans `app/layout.tsx` :

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>          {/* 🎯 UN SEUL PROVIDER RACINE */}
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Avantages** :
- ✅ État partagé dans toute l'application
- ✅ Pas de duplication de logique d'authentification  
- ✅ Point de contrôle unique pour les connexions/déconnexions

#### 2. Pattern centralisé avec un seul fetch `/api/auth/me`

Toute vérification d'authentification passe par une fonction centralisée :

```tsx
// contexts/AuthContext.tsx
const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',  // 🍪 Cookies automatiques
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (response.ok) {
    const userData = await response.json();
    setUser(userData);  // 🎯 État global mis à jour
    return true;
  }
  
  setUser(null);
  return false;
};
```

**Avantages** :
- 🚀 **Performance** : Un seul appel réseau pour l'authentification
- 🛡️ **Sécurité** : Gestion centralisée des sessions
- 🧹 **Maintenabilité** : Code DRY sans duplication

#### 3. Hook useAuth dans tous les composants

Les composants consomment l'authentification via un hook unifié :

```tsx
// Dans vos composants
const { user, loading, initialized, isAuthenticated } = useAuth();

// Logique de redirection sécurisée
if (initialized && !loading && !isAuthenticated) {
  router.push('/login');
  return;
}
```

**Avantages** :
- 🔄 **Réactivité** : Mise à jour automatique de l'UI
- 🎯 **Simplicité** : Interface unifiée pour tous les composants
- 🛡️ **Type Safety** : Types TypeScript stricts

#### 4. Redirections sécurisées vers /login

Les pages protégées utilisent un pattern de redirection robuste :

```tsx
// Pattern de protection dans les pages
const { user, loading, initialized, isAuthenticated } = useAuth();
const hasMounted = useHasMounted();

// 🛡️ REDIRECTION SÉCURISÉE
if (hasMounted && initialized && !loading && !isAuthenticated) {
  router.push('/login');
  return <LoadingSpinner />;  // Évite le flash de contenu
}

// ✅ Contenu protégé affiché seulement si authentifié
return <ProtectedContent />;
```

**Composant AuthGuard** pour simplifier :

```tsx
<AuthGuard fallback={<LoginPrompt />}>
  <ProtectedContent />
</AuthGuard>
```

### Avantages de cette architecture

- 🚀 **Performance** : Un seul appel réseau pour l'authentification
- 🛡️ **Sécurité** : Redirections conditionnelles robustes
- 🧹 **Maintenabilité** : Code DRY avec une logique centralisée
- 🔧 **Debugging** : Logs structurés pour tracer les états
- 💾 **État consistant** : Synchronisation automatique dans toute l'app

### Recommandations pour l'amélioration

Pour étendre ce système, considérez :

1. **Refresh Token automatique** :
```tsx
// Intercepteur pour renouveler le token expiré
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (response.ok) await fetchCurrentUser();
};
```

2. **Gestion de session avancée** :
```tsx
// Détection d'inactivité et logout automatique
const useSessionTimeout = (minutes: number) => {
  useEffect(() => {
    const timer = setTimeout(() => logout(), minutes * 60 * 1000);
    return () => clearTimeout(timer);
  }, [user?.lastActivity]);
};
```

3. **Tests End-to-End** :
```typescript
// Tests Playwright pour valider les flux d'authentification
test('Login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/');
});
```

4. **Monitoring et analytics** :
```tsx
// Tracking des événements d'authentification
useEffect(() => {
  if (user) {
    analytics.track('user_login', { 
      method: 'email',
      timestamp: new Date().toISOString() 
    });
  }
}, [user]);
```

Cette architecture garantit une base solide et extensible pour l'authentification dans une application Next.js moderne.

## 🧪 Tests End-to-End avec Playwright

Cinetech 2.0 intègre une suite de tests E2E pour valider les flux critiques de l'application.

### Installation et Configuration

1. **Installation des dépendances** :
```bash
cd frontend
npm install
npx playwright install
```

2. **Configuration des identifiants de test** :
Modifiez `frontend/tests/e2e/config.ts` avec vos identifiants de test :
```typescript
export const TEST_CONFIG = {
  TEST_USER: {
    email: 'test@cinetech.com',
    password: 'TestPassword123!',
  },
};
```

### Scripts disponibles

```bash
# Exécution des tests en mode headless
npm run test:e2e

# Interface graphique interactive
npm run test:e2e:ui

# Mode debug avec pause sur échec
npm run test:e2e:debug

# Voir le rapport HTML des tests
npm run test:e2e:report
```

### Tests implementés

#### 1. **Flux d'authentification complet**
- ✅ Navigation vers `/login`
- ✅ Saisie des identifiants
- ✅ Vérification de la redirection vers l'accueil
- ✅ Contrôle de l'état connecté (icône profil visible)
- ✅ Accès autorisé à `/favorites`

#### 2. **Tests de sécurité**
- ✅ Redirection vers `/login` pour utilisateur non connecté
- ✅ Accès refusé aux pages protégées
- ✅ Gestion des erreurs de connexion

#### 3. **Tests de robustesse**
- ✅ Gestion des timeouts réseau
- ✅ Validation des mauvais identifiants
- ✅ Vérification des redirections multiples

### Structure des tests

```
frontend/tests/e2e/
├── auth.spec.ts          # Tests d'authentification
├── config.ts            # Configuration et helpers
└── README.md            # Documentation détaillée
```

### Configuration pour votre environnement

Dans `playwright.config.ts`, adaptez l'URL de base :
```typescript
export default defineConfig({
  use: {
    baseURL: 'https://votre-domaine.com',  // 🎯 Votre URL
  },
});
```

### Bonnes pratiques

- 🔐 **Compte de test dédié** : Utilisez des identifiants séparés de la production
- 🧹 **Tests isolés** : Chaque test est indépendant
- 📊 **Rapports automatiques** : Screenshots et traces en cas d'échec
- 🔄 **CI/CD ready** : Compatible avec les pipelines d'intégration continue

Pour plus de détails, consultez `frontend/tests/e2e/README.md`.

## Fonctionnalités clés

- Parcourir les films et les émissions de télévision
- Authentification des utilisateurs
- Enregistrer des favoris
- Laisser des commentaires et des évaluations

## Migrations Prisma avec Docker

Pour exécuter des migrations Prisma dans l'environnement Docker:

1. Assurez-vous que vos conteneurs Docker sont en cours d'exécution:
```bash
docker-compose up -d
```

2. Rendez le script de migration exécutable (uniquement la première fois):
```bash
chmod +x ./scripts/prisma-migrate.sh
```

3. Exécutez une migration avec:
```bash
./scripts/prisma-migrate.sh nom_de_votre_migration
```
Par exemple: `./scripts/prisma-migrate.sh add_user_status`

4. Pour visualiser votre base de données après la migration:
```bash
docker-compose exec backend npx prisma studio
```
Puis accédez à http://localhost:5555 dans votre navigateur.

## Autres commandes utiles

- Générer le client Prisma:
```bash
docker-compose exec backend npx prisma generate
```

- Réinitialiser la base de données (⚠️ supprime toutes les données):
```bash
docker-compose exec backend npx prisma migrate reset --force
```
