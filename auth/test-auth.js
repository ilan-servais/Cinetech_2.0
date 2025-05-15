#!/usr/bin/env node

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/auth'; // Ajustez selon votre configuration
const MAILHOG_API_URL = 'http://localhost:8025/api/v2/messages';
const TEST_USER = {
  email: `test_user_${Date.now()}@example.com`,
  name: 'Test User',
  password: 'Password123!'
};

// Utilitaires pour l'affichage
const log = {
  info: (message) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  warning: (message) => console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  json: (data) => console.log(JSON.stringify(data, null, 2))
};

// Fonction utilitaire pour attendre
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Enregistrer un nouvel utilisateur
async function registerUser() {
  log.info(`Enregistrement de l'utilisateur: ${TEST_USER.email}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success(`Utilisateur enregistré avec succès`);
      log.json(data);
      return true;
    } else {
      log.error(`Échec de l'enregistrement: ${response.status} ${response.statusText}`);
      log.json(data);
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors de l'enregistrement: ${error.message}`);
    return false;
  }
}

// 2. Récupérer le code de vérification depuis MailHog
async function getVerificationCode() {
  log.info(`Récupération du code de vérification depuis MailHog...`);
  log.info(`Attente de l'arrivée de l'email (2 secondes)...`);
  
  // Attendre que l'email arrive
  await wait(2000);
  
  try {
    const response = await fetch(MAILHOG_API_URL);
    
    if (!response.ok) {
      log.error(`Erreur lors de la récupération des emails: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      log.warning(`Aucun email trouvé dans MailHog`);
      return null;
    }
    
    log.success(`${data.items.length} email(s) trouvé(s) dans MailHog`);
    
    // Chercher l'email destiné à notre utilisateur de test
    const userEmails = data.items.filter(
      item => item.Content && 
             item.Content.Headers && 
             item.Content.Headers.To && 
             item.Content.Headers.To.some(to => to.includes(TEST_USER.email))
    );
    
    if (userEmails.length === 0) {
      log.warning(`Aucun email trouvé pour ${TEST_USER.email}`);
      return null;
    }
    
    // Prendre le dernier email reçu (le plus récent)
    const latestEmail = userEmails[0];
    const emailBody = latestEmail.Content.Body;
    
    log.success(`Email trouvé pour ${TEST_USER.email}`);
    
    // Extraction du code de vérification - expression régulière pour chercher un nombre à 6 chiffres
    const codeMatch = emailBody.match(/\b(\d{6})\b/);
    
    if (codeMatch) {
      const verificationCode = codeMatch[1];
      log.success(`Code de vérification extrait: ${verificationCode}`);
      return verificationCode;
    } else {
      log.warning(`Impossible de trouver un code de vérification à 6 chiffres dans l'email`);
      log.info(`Contenu de l'email:`);
      log.info(emailBody);
      return null;
    }
  } catch (error) {
    log.error(`Erreur lors de la récupération du code: ${error.message}`);
    return null;
  }
}

// 3. Vérifier l'email avec le code
async function verifyEmail(code) {
  log.info(`Vérification de l'email avec le code: ${code}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        code: code
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success(`Email vérifié avec succès`);
      log.json(data);
      return true;
    } else {
      log.error(`Échec de la vérification: ${response.status} ${response.statusText}`);
      log.json(data);
      return false;
    }
  } catch (error) {
    log.error(`Erreur lors de la vérification: ${error.message}`);
    return false;
  }
}

// 4. Se connecter pour obtenir un JWT
async function login() {
  log.info(`Connexion avec ${TEST_USER.email}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      log.success(`Connexion réussie, JWT obtenu`);
      log.info(`JWT: ${data.token}`);
      return data.token;
    } else {
      log.error(`Échec de la connexion: ${response.status} ${response.statusText}`);
      log.json(data);
      return null;
    }
  } catch (error) {
    log.error(`Erreur lors de la connexion: ${error.message}`);
    return null;
  }
}

// Fonction principale qui exécute la séquence de test complète
async function runAuthTest() {
  console.log('\n=== DÉBUT DU TEST D\'AUTHENTIFICATION ===\n');
  
  // Étape 1: Enregistrer un nouvel utilisateur
  const registered = await registerUser();
  if (!registered) {
    log.error('Le test ne peut pas continuer sans un enregistrement réussi');
    process.exit(1);
  }
  
  // Étape 2: Récupérer le code de vérification
  let verificationCode = await getVerificationCode();
  
  // Si pas de code trouvé, utiliser le code par défaut
  if (!verificationCode) {
    verificationCode = '123456'; // Code de fallback
    log.warning(`Utilisation du code de fallback: ${verificationCode}`);
  }
  
  // Étape 3: Vérifier l'email
  const verified = await verifyEmail(verificationCode);
  if (!verified) {
    log.error('Le test ne peut pas continuer sans une vérification réussie');
    process.exit(1);
  }
  
  // Étape 4: Se connecter
  const token = await login();
  if (!token) {
    log.error('Échec de l\'obtention du JWT');
    process.exit(1);
  }
  
  console.log('\n=== FIN DU TEST D\'AUTHENTIFICATION ===\n');
  log.success('Le test complet a réussi!');
}

// Exécuter le test
runAuthTest().catch(error => {
  log.error(`Erreur inattendue: ${error.message}`);
  process.exit(1);
});
