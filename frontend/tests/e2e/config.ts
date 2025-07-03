/**
 * 🔧 CONFIGURATION DES TESTS E2E
 * 
 * Ce fichier contient la configuration pour les tests Playwright
 * Modifiez les identifiants selon votre environnement de test
 */

export const TEST_CONFIG = {
  // 🌐 URLs de test
  BASE_URL: 'https://frontend-cinetech.onrender.com',
  
  // 👤 Identifiants de test
  // IMPORTANT: Créez un compte de test dédié pour ces identifiants
  TEST_USER: {
    email: 'Ilan7servais@gmail.com',
    password: 'eS6dBpYxfMDnDhX',
    // Si vous avez un compte test réel, utilisez-le ici :
    // email: 'votre-email-test@exemple.com',
    // password: 'votre-mot-de-passe-test',
  },
  
  // ⏱️ Timeouts (en millisecondes)
  TIMEOUTS: {
    navigation: 10000,
    element: 5000,
    api: 3000,
  },
  
  // 🎯 Sélecteurs CSS communs
  SELECTORS: {
    // Login page
    emailInput: 'input[type="email"], input[name="email"], input#email',
    passwordInput: 'input[type="password"], input[name="password"], input#password',
    submitButton: 'button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")',
    
    // Navigation
    loginButton: 'button:has-text("Connexion"), a:has-text("Connexion"), button:has-text("Se connecter")',
    logoutButton: 'button:has-text("Déconnexion"), button:has-text("Se déconnecter"), a:has-text("Déconnexion")',
    
    // User indicators when logged in
    userProfile: '[data-testid="user-profile"], .user-icon, [data-testid="user-menu"], button:has-text("Mon profil")',
    userIcon: 'svg[data-icon="user"], .fa-user, .user-avatar',
    
    // Favorites page
    favoritesContainer: '[data-testid="favorites"], .favorites-container, h1:has-text("Favoris"), h2:has-text("Favoris")',
    
    // Error messages
    authRequired: 'text=/connexion.*requise|veuillez.*connecter|accès.*interdit/i',
    loginError: '.error, .alert-error, [role="alert"]',
  }
};

/**
 * 🛠️ UTILITAIRES POUR LES TESTS
 */
export const TEST_HELPERS = {
  /**
   * Attend qu'une URL ne contienne pas un certain pattern
   */
  waitForUrlNotContaining: (page: any, pattern: string, timeout = 10000) => {
    return page.waitForURL((url: URL) => !url.pathname.includes(pattern), { timeout });
  },
  
  /**
   * Vérifie si l'utilisateur semble connecté
   */
  checkIfLoggedIn: async (page: any) => {
    // Vérifier l'absence du bouton de connexion
    const loginButton = page.locator(TEST_CONFIG.SELECTORS.loginButton);
    try {
      await loginButton.waitFor({ timeout: 2000 });
      return false; // Bouton de connexion visible = pas connecté
    } catch {
      return true; // Bouton de connexion absent = connecté
    }
  },
  
  /**
   * Effectue une connexion complète
   */
  login: async (page: any, email?: string, password?: string) => {
    const loginEmail = email || TEST_CONFIG.TEST_USER.email;
    const loginPassword = password || TEST_CONFIG.TEST_USER.password;
    
    await page.goto('/login');
    await page.locator(TEST_CONFIG.SELECTORS.emailInput).fill(loginEmail);
    await page.locator(TEST_CONFIG.SELECTORS.passwordInput).fill(loginPassword);
    await page.locator(TEST_CONFIG.SELECTORS.submitButton).click();
    
    // Attendre la redirection
    await TEST_HELPERS.waitForUrlNotContaining(page, '/login');
  }
};
