import express from 'express';

const router = express.Router();

// 🔍 ROUTE DEBUG - Afficher tout ce que reçoit le backend
router.get('/cookies', (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent'),
    headers: {
      cookie: req.get('Cookie'),
      authorization: req.get('Authorization'),
      'content-type': req.get('Content-Type'),
      'user-agent': req.get('User-Agent'),
      'accept': req.get('Accept'),
      'accept-language': req.get('Accept-Language'),
      'accept-encoding': req.get('Accept-Encoding'),
      'connection': req.get('Connection'),
      'upgrade-insecure-requests': req.get('Upgrade-Insecure-Requests'),
      'sec-fetch-dest': req.get('Sec-Fetch-Dest'),
      'sec-fetch-mode': req.get('Sec-Fetch-Mode'),
      'sec-fetch-site': req.get('Sec-Fetch-Site'),
      'referer': req.get('Referer'),
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-forwarded-proto': req.get('X-Forwarded-Proto'),
      'x-forwarded-host': req.get('X-Forwarded-Host')
    },
    cookies: req.cookies,
    signedCookies: req.signedCookies,
    rawHeaders: req.rawHeaders,
    allHeaders: req.headers
  };

  console.log('🔍 [DEBUG] Cookie Debug Info:', JSON.stringify(debugInfo, null, 2));

  res.json({
    success: true,
    debug: debugInfo,
    cookiesFound: Object.keys(req.cookies || {}).length,
    authTokenPresent: !!(req.cookies?.auth_token),
    authTokenValue: req.cookies?.auth_token ? `${req.cookies.auth_token.substring(0, 20)}...` : null
  });
});

// 🔍 ROUTE DEBUG - Tester une route protégée simple
router.get('/protected', (req, res) => {
  const authHeader = req.get('Authorization');
  const cookieHeader = req.get('Cookie');
  const cookies = req.cookies;
  
  console.log('🔍 [DEBUG] Protected Route Debug:', {
    authHeader,
    cookieHeader,
    cookies,
    authTokenCookie: cookies?.auth_token
  });

  res.json({
    success: true,
    message: 'Route protégée accessible',
    authHeader: authHeader || 'Aucun header Authorization',
    cookieHeader: cookieHeader || 'Aucun header Cookie',
    parsedCookies: cookies || {},
    authToken: cookies?.auth_token || 'Token non trouvé'
  });
});

export default router;
