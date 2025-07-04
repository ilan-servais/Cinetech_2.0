/**
 * 🔍 SCRIPT DE DEBUG D'AUTHENTIFICATION
 * 
 * Exécutez ce script dans la console de votre navigateur
 * pour diagnostiquer les problèmes d'authentification.
 */

const DEBUG_AUTH = {
  async testConnection() {
    console.log('🔍 [DEBUG] Testing authentication flow...');
    
    // 1. Vérifier les cookies actuels
    console.log('🍪 [DEBUG] Current cookies:', document.cookie);
    
    // 2. Vérifier l'API URL
    console.log('🌐 [DEBUG] API URL:', window.location.origin);
    
    // 3. Test du debug endpoint
    try {
      const debugResponse = await fetch('https://cinetech-2-0.onrender.com/api/debug/cookies', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const debugData = await debugResponse.json();
      console.log('🔍 [DEBUG] Debug endpoint response:', debugData);
      
    } catch (error) {
      console.error('❌ [DEBUG] Debug endpoint failed:', error);
    }
    
    // 4. Test du endpoint /api/auth/me
    try {
      const authResponse = await fetch('https://cinetech-2-0.onrender.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔐 [DEBUG] Auth /me status:', authResponse.status);
      console.log('🔐 [DEBUG] Auth /me headers:', Object.fromEntries(authResponse.headers.entries()));
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('✅ [DEBUG] User data:', userData);
      } else {
        const errorText = await authResponse.text();
        console.log('❌ [DEBUG] Auth error:', errorText);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Auth endpoint failed:', error);
    }
  },

  async testLogin(email, password) {
    console.log('🔑 [DEBUG] Testing login...');
    
    try {
      const loginResponse = await fetch('https://cinetech-2-0.onrender.com/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('🔑 [DEBUG] Login status:', loginResponse.status);
      console.log('🔑 [DEBUG] Login headers:', Object.fromEntries(loginResponse.headers.entries()));
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ [DEBUG] Login success:', loginData);
        console.log('🍪 [DEBUG] Cookies after login:', document.cookie);
        
        // Test immediate auth check
        await this.testConnection();
      } else {
        const errorText = await loginResponse.text();
        console.log('❌ [DEBUG] Login error:', errorText);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Login failed:', error);
    }
  }
};

// Expose globally for browser console
window.DEBUG_AUTH = DEBUG_AUTH;

console.log('🔍 [DEBUG] Auth debug script loaded. Use DEBUG_AUTH.testConnection() or DEBUG_AUTH.testLogin(email, password)');
