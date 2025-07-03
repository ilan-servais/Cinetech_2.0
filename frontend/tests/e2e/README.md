# 🧪 Guide des Tests E2E avec Playwright

Ce document explique comment utiliser et exécuter les tests End-to-End (E2E) pour Cinetech.

## 📋 Prérequis

1. **Node.js** installé (version 14+)
2. **Navigateurs Playwright** installés
3. **Compte de test** avec identifiants valides

## 🚀 Installation et Configuration

### 1. Installation des dépendances
```bash
cd frontend
npm install
```

### 2. Installation des navigateurs Playwright
```bash
npx playwright install
```

### 3. Configuration des identifiants de test

Modifiez le fichier `tests/e2e/config.ts` :

```typescript
export const TEST_CONFIG = {
  // Remplacez par vos vrais identifiants de test
  TEST_USER: {
    email: 'votre-email-test@exemple.com',
    password: 'votre-mot-de-passe-test',
  },
  // ...
};
```

## 🎯 Exécution des Tests

### Tests en mode headless (sans interface)
```bash
npm run test:e2e
```

### Tests avec interface graphique
```bash
npm run test:e2e:ui
```

### Tests en mode debug
```bash
npm run test:e2e:debug
```

### Voir le rapport des tests
```bash
npm run test:e2e:report
```

## 📝 Tests Disponibles

### 1. Test d'Authentification Complète
- ✅ Navigation vers `/login`
- ✅ Saisie des identifiants
- ✅ Soumission du formulaire
- ✅ Vérification de la redirection
- ✅ Contrôle de l'état connecté
- ✅ Accès à la page `/favorites`

### 2. Test de Sécurité
- ✅ Tentative d'accès à `/favorites` sans authentification
- ✅ Vérification de la redirection vers `/login`

### 3. Test de Gestion d'Erreurs
- ✅ Tentative de connexion avec de mauvais identifiants
- ✅ Vérification que l'utilisateur reste sur `/login`

## 🔧 Configuration Avancée

### Modifier l'URL de test
Dans `playwright.config.ts` :
```typescript
use: {
  baseURL: 'https://votre-domaine.com', // Changez ici
  // ...
}
```

### Ajuster les timeouts
Dans `tests/e2e/config.ts` :
```typescript
TIMEOUTS: {
  navigation: 10000,  // 10 secondes
  element: 5000,      // 5 secondes
  api: 3000,          // 3 secondes
}
```

### Personnaliser les sélecteurs CSS
Si votre interface change, modifiez les sélecteurs dans `config.ts` :
```typescript
SELECTORS: {
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  // ...
}
```

## 🐛 Dépannage

### Problème : "Test failed - Element not found"
- Vérifiez que les sélecteurs CSS correspondent à votre interface
- Augmentez les timeouts si la page est lente à charger

### Problème : "Navigation timeout"
- Vérifiez que l'URL de base est correcte
- Vérifiez que le site est accessible

### Problème : "Login failed"
- Vérifiez que les identifiants de test sont corrects
- Créez un compte de test dédié si nécessaire

## 🎨 Personnalisation

### Ajouter de nouveaux tests
Créez un nouveau fichier dans `tests/e2e/` :

```typescript
import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './config';

test.describe('Mon nouveau test', () => {
  test('Test personnalisé', async ({ page }) => {
    await page.goto('/ma-page');
    // Votre logique de test...
  });
});
```

### Exécuter un test spécifique
```bash
npx playwright test auth.spec.ts
```

### Exécuter sur un navigateur spécifique
```bash
npx playwright test --project=chromium
```

## 📊 Rapports et Screenshots

Les tests génèrent automatiquement :
- **Screenshots** en cas d'échec
- **Vidéos** des échecs
- **Traces** pour le debug
- **Rapport HTML** complet

Consultez le rapport avec :
```bash
npm run test:e2e:report
```

## 🔒 Bonnes Pratiques

1. **Utilisez un compte de test dédié** - Ne jamais utiliser de vrais comptes utilisateur
2. **Isolez vos tests** - Chaque test doit être indépendant
3. **Nettoyez après vos tests** - Supprimez les données créées pendant les tests
4. **Vérifiez régulièrement** - Exécutez les tests après chaque déploiement

## 🚨 Important

⚠️ **N'oubliez pas de :**
- Créer un compte de test avec les identifiants configurés
- Vérifier que le site est accessible à l'URL configurée
- Adapter les sélecteurs si l'interface change
- Maintenir les tests à jour avec les évolutions de l'application
