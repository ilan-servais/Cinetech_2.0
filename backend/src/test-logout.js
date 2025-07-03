/**
 * 🧪 SCRIPT DE TEST - LOGOUT COOKIE SUPPRESSION
 * 
 * Ce script teste la suppression du cookie auth_token lors du logout
 * À exécuter manuellement pour valider la correction
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://cinetech-2-0.onrender.com';

async function testLogoutCookieSuppression() {
  console.log('🧪 [TEST] Début du test de suppression de cookie logout...\n');
  
  try {
    // 1️⃣ Tester l'endpoint logout (même sans être connecté)
    console.log('1️⃣ Test de l\'endpoint logout...');
    
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'auth_token=fake-token-for-test'
      }
    });
    
    const logoutData = await logoutResponse.json();
    console.log('📤 Logout Response Status:', logoutResponse.status);
    console.log('📤 Logout Response Body:', logoutData);
    
    // Vérifier les headers Set-Cookie
    const setCookieHeaders = logoutResponse.headers.get('set-cookie');
    console.log('🍪 Set-Cookie Headers:', setCookieHeaders);
    
    if (setCookieHeaders) {
      const cookieStrings = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      
      cookieStrings.forEach((cookieString, index) => {
        console.log(`🍪 Cookie ${index + 1}:`, cookieString);
        
        if (cookieString.includes('auth_token=')) {
          console.log('✅ auth_token cookie trouvé dans la réponse');
          
          if (cookieString.includes('Expires=') || cookieString.includes('Max-Age=0')) {
            console.log('✅ Cookie configuré pour expirer');
          } else {
            console.log('❌ Cookie ne semble pas configuré pour expirer');
          }
        }
      });
    } else {
      console.log('❌ Aucun header Set-Cookie trouvé');
    }
    
    console.log('\n✅ Test terminé ! Vérifiez les logs ci-dessus.');
    
  } catch (error) {
    console.error('❌ [TEST] Erreur:', error.message);
  }
}

// Exécuter le test
testLogoutCookieSuppression();
