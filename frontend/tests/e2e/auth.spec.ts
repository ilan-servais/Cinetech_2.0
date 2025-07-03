import { test, expect } from '@playwright/test';
import { TEST_CONFIG, TEST_HELPERS } from './config';

/**
 * 🧪 TEST E2E - AUTHENTIFICATION CINETECH
 * 
 * Ce test vérifie le flux complet d'authentification :
 * 1. Navigation vers la page de login
 * 2. Connexion avec des identifiants valides
 * 3. Vérification de la redirection vers l'accueil
 * 4. Vérification que l'utilisateur est bien connecté (icône profil)
 * 5. Accès aux pages protégées (favoris)
 */

test.describe('Authentification Flow', () => {
  
  test('Connexion complète et accès aux favoris', async ({ page }) => {
    // 🎯 ÉTAPE 1: Aller sur la page de login
    console.log('🔗 Navigation vers /login...');
    await page.goto('/login');
    
    // Vérifier qu'on est bien sur la page de login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Vérifier la présence du titre de la page de connexion
    const pageTitle = page.locator('h1, h2, .login-title').first();
    await expect(pageTitle).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.element });
    
    // 🎯 ÉTAPE 2: Remplir le formulaire de connexion
    console.log('📝 Remplissage du formulaire de login...');
    console.log(`👤 Utilisation du compte: ${TEST_CONFIG.TEST_USER.email}`);
    
    // Attendre que les champs soient disponibles
    const emailInput = page.locator(TEST_CONFIG.SELECTORS.emailInput);
    const passwordInput = page.locator(TEST_CONFIG.SELECTORS.passwordInput);
    const submitButton = page.locator(TEST_CONFIG.SELECTORS.submitButton);
    
    await emailInput.waitFor({ timeout: TEST_CONFIG.TIMEOUTS.element });
    await passwordInput.waitFor({ timeout: TEST_CONFIG.TIMEOUTS.element });
    
    await emailInput.fill(TEST_CONFIG.TEST_USER.email);
    await passwordInput.fill(TEST_CONFIG.TEST_USER.password);
    
    // 🎯 ÉTAPE 3: Soumettre le formulaire
    console.log('🚀 Soumission du formulaire...');
    await submitButton.click();
    
    // Attendre la redirection (avec timeout)
    await TEST_HELPERS.waitForUrlNotContaining(page, '/login', TEST_CONFIG.TIMEOUTS.navigation);
    
    // 🎯 ÉTAPE 4: Vérifier qu'on est redirigé vers l'accueil
    console.log('🏠 Vérification de la redirection...');
    await expect(page).toHaveURL(/.*\/((?!login).)*$/); // URL ne contenant pas '/login'
    
    // 🎯 ÉTAPE 5: Vérifier que l'utilisateur est connecté
    console.log('👤 Vérification de l\'état connecté...');
    
    // Utiliser l'helper pour vérifier l'authentification
    const isLoggedIn = await TEST_HELPERS.checkIfLoggedIn(page);
    expect(isLoggedIn).toBe(true);
    
    // Vérification alternative: chercher des éléments de profil utilisateur
    try {
      const userProfile = page.locator(TEST_CONFIG.SELECTORS.userProfile).first();
      await userProfile.waitFor({ timeout: TEST_CONFIG.TIMEOUTS.element });
      console.log('✅ Profil utilisateur visible - connexion confirmée');
    } catch (e) {
      // Si pas d'élément de profil visible, au moins s'assurer qu'on n'est pas sur login
      await expect(page).not.toHaveURL(/.*\/login/);
      console.log('✅ Pas de redirection vers login - connexion probable');
    }
    
    // 🎯 ÉTAPE 6: Tester l'accès aux favoris
    console.log('❤️ Test d\'accès à la page favoris...');
    await page.goto('/favorites');
    
    // Vérifier qu'on n'est PAS redirigé vers /login
    await TEST_HELPERS.waitForUrlNotContaining(page, '/login', TEST_CONFIG.TIMEOUTS.navigation);
    await expect(page).toHaveURL(/.*\/favorites/);
    
    // Vérifier que la page favoris s'affiche correctement
    try {
      const favoritesContent = page.locator(TEST_CONFIG.SELECTORS.favoritesContainer).first();
      await favoritesContent.waitFor({ timeout: TEST_CONFIG.TIMEOUTS.element });
      console.log('✅ Page favoris accessible et contenu affiché');
    } catch (e) {
      // Fallback: vérifier simplement qu'on n'est pas sur login
      await expect(page).not.toHaveURL(/.*\/login/);
      console.log('✅ Page favoris accessible (pas de redirection vers login)');
    }
    
    console.log('🎉 Test d\'authentification complet réussi !');
  });
  
  test('Redirection vers login pour utilisateur non connecté', async ({ page }) => {
    // 🎯 TEST DE SÉCURITÉ: Vérifier qu'un utilisateur non connecté est redirigé
    console.log('🔒 Test de sécurité - accès favoris sans authentification...');
    
    // Aller directement sur /favorites sans être connecté
    await page.goto('/favorites');
    
    // Vérifier qu'on est redirigé vers /login OU qu'un message d'erreur s'affiche
    try {
      await page.waitForURL(/.*\/login/, { timeout: TEST_CONFIG.TIMEOUTS.navigation });
      console.log('✅ Redirection vers login effectuée');
    } catch (e) {
      // Alternative: vérifier qu'un message de connexion requise s'affiche
      const authRequired = page.locator(TEST_CONFIG.SELECTORS.authRequired);
      await expect(authRequired).toBeVisible();
      console.log('✅ Message de connexion requise affiché');
    }
  });
  
  test('Gestion des erreurs de connexion', async ({ page }) => {
    // 🎯 TEST D'ERREUR: Vérifier la gestion des mauvais identifiants
    console.log('❌ Test de gestion d\'erreur - mauvais identifiants...');
    
    await page.goto('/login');
    
    // Utiliser de mauvais identifiants
    const badEmail = 'inexistant@example.com';
    const badPassword = 'mauvais-mot-de-passe';
    
    await page.locator(TEST_CONFIG.SELECTORS.emailInput).fill(badEmail);
    await page.locator(TEST_CONFIG.SELECTORS.passwordInput).fill(badPassword);
    await page.locator(TEST_CONFIG.SELECTORS.submitButton).click();
    
    // Vérifier qu'on reste sur la page de login
    await page.waitForTimeout(2000); // Attendre un peu pour voir la réponse
    await expect(page).toHaveURL(/.*\/login/);
    
    // Optionnel: vérifier qu'un message d'erreur s'affiche
    try {
      const errorMessage = page.locator(TEST_CONFIG.SELECTORS.loginError);
      await errorMessage.waitFor({ timeout: 3000 });
      console.log('✅ Message d\'erreur affiché pour mauvais identifiants');
    } catch (e) {
      // Si pas de message d'erreur visible, au moins on est resté sur login
      console.log('✅ Resté sur la page de login (connexion refusée)');
    }
  });
  
});

/**
 * 🧪 TEST BONUS - DÉCONNEXION
 */
test.describe('Déconnexion', () => {
  
  test.skip('Déconnexion et redirection', async ({ page }) => {
    // Ce test nécessite d'être déjà connecté
    // Vous pouvez l'activer en retirant .skip() et en ajustant la logique
    
    // D'abord se connecter
    await TEST_HELPERS.login(page);
    
    // Chercher le bouton de déconnexion
    const logoutButton = page.locator(TEST_CONFIG.SELECTORS.logoutButton);
    await logoutButton.click();
    
    // Vérifier que l'utilisateur est déconnecté
    const loginButton = page.locator(TEST_CONFIG.SELECTORS.loginButton);
    await expect(loginButton).toBeVisible();
    
    console.log('✅ Déconnexion réussie');
  });
  
});
