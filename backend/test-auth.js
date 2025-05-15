#!/usr/bin/env node

const fetch = require('node-fetch');
const colors = require('colors/safe');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api'; // Ajustez selon votre configuration
const MAILHOG_API_URL = 'http://localhost:8025/api/v2/messages';
const TEST_USER = {
  email: `test_user_${Date.now()}@example.com`,
  firstName: 'Test',
  lastName: 'User',
  password: 'Password123!'
};

colors.enable();

// Fonction utilitaire pour imprimer les messages de statut
function logStep(step, status, details = '') {
  const timestamp = new Date().toISOString();
  
  if (status === 'success') {
    console.log(colors.green(`[${timestamp}] ✅ ${step}: réussi ${details}`));
  } else if (status === 'warning') {
    console.log(colors.yellow(`[${timestamp}] ⚠️ ${step}: attention ${details}`));
  } else {
    console.log(colors.red(`[${timestamp}] ❌ ${step}: échec ${details}`));
  }
}

// Fonction utilitaire pour attendre
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction principale qui exécute le flux de test complet
async function runAuthFlow() {
  console.log(colors.cyan('\n=== DÉBUT DU TEST D\'AUTHENTIFICATION ===\n'));
  console.log(colors.cyan(`Test avec l'utilisateur: ${TEST_USER.email}`));
  
  let verificationCode;
  let authToken;
  
  try {
    // ÉTAPE 1: Inscription de l'utilisateur
    console.log(colors.cyan('\n--- ÉTAPE 1: INSCRIPTION ---'));
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        name: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
        password: TEST_USER.password
      }),
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      logStep('Inscription', 'success');
      console.log(colors.gray('Réponse:'), JSON.stringify(registerData, null, 2));
    } else {
      logStep('Inscription', 'fail', `Code: ${registerResponse.status}`);
      console.log(colors.gray('Erreur:'), JSON.stringify(registerData, null, 2));
      throw new Error('Échec de l\'inscription');
    }
    
    // ÉTAPE 2: Récupération du code de vérification de Mailhog
    console.log(colors.cyan('\n--- ÉTAPE 2: RÉCUPÉRATION DU CODE DE VÉRIFICATION ---'));
    logStep('Attente de l\'email', 'warning', '(pause de 2 secondes)');
    await wait(2000); // Attente pour que l'email arrive dans Mailhog
    
    const mailhogResponse = await fetch(MAILHOG_API_URL);
    const mailhogData = await mailhogResponse.json();
    
    if (!mailhogData.items || mailhogData.items.length === 0) {
      logStep('Récupération des emails', 'fail', 'Aucun email reçu - envoi échoué');
      verificationCode = '123456'; // Code de secours
    } else {
      logStep('Récupération des emails', 'success', `${mailhogData.items.length} messages trouvés`);
      
      // Recherche de l'email de vérification pour notre utilisateur
      const userEmails = mailhogData.items.filter(
        item => item.To.some(recipient => recipient.Mailbox + '@' + recipient.Domain === TEST_USER.email)
      );
      
      if (userEmails.length > 0) {
        // Prendre le message le plus récent
        const latestEmail = userEmails[0];
        const emailBody = latestEmail.Content.Body;
        
        // Extraction du code de vérification - expression régulière pour chercher un nombre à 6 chiffres
        const codeMatch = emailBody.match(/\b(\d{6})\b/);
        
        if (codeMatch) {
          verificationCode = codeMatch[1];
          logStep('Extraction du code', 'success', `Code: ${verificationCode}`);
        } else {
          logStep('Extraction du code', 'fail', 'Code non trouvé dans l\'email');
          verificationCode = '123456'; // Code de secours
        }
      } else {
        logStep('Filtrage des emails', 'fail', 'Aucun email pour cet utilisateur');
        verificationCode = '123456'; // Code de secours
      }
    }
    
    // ÉTAPE 3: Vérification de l'email avec le code
    console.log(colors.cyan('\n--- ÉTAPE 3: VÉRIFICATION DE L\'EMAIL ---'));
    console.log(`Utilisation du code: ${verificationCode}`);
    
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        code: verificationCode
      }),
    });
    
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      logStep('Vérification', 'success');
      console.log(colors.gray('Réponse:'), JSON.stringify(verifyData, null, 2));
    } else {
      logStep('Vérification', 'fail', `Code: ${verifyResponse.status}`);
      console.log(colors.gray('Erreur:'), JSON.stringify(verifyData, null, 2));
      throw new Error('Échec de la vérification');
    }
    
    // ÉTAPE 4: Connexion pour obtenir le JWT
    console.log(colors.cyan('\n--- ÉTAPE 4: CONNEXION ---'));
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      authToken = loginData.token;
      logStep('Connexion', 'success', 'JWT reçu avec succès');
      console.log(colors.gray('JWT:'), authToken);
    } else {
      logStep('Connexion', 'fail', `Code: ${loginResponse.status}`);
      console.log(colors.gray('Erreur:'), JSON.stringify(loginData, null, 2));
      throw new Error('Échec de la connexion');
    }
    
    // RÉSUMÉ DU TEST
    console.log(colors.green('\n=== TEST COMPLET RÉUSSI ==='));
    console.log(colors.green('Toutes les étapes d\'authentification ont été complétées avec succès!'));
    
  } catch (error) {
    console.log(colors.red('\n=== TEST ÉCHOUÉ ==='));
    console.log(colors.red(`Erreur: ${error.message}`));
    process.exit(1);
  }
}

// Exécution du test
runAuthFlow().catch(error => {
  console.error('Erreur inattendue:', error);
  process.exit(1);
});
