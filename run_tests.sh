#!/usr/bin/env bash
set -euo pipefail

API="http://localhost:3001/api"
COOKIE_FILE="cookies.tmp"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "1) TEST PRÉ-VOLS CORS (OPTIONS) SUR LES ENDPOINTS PUBLICS"
echo "────────────────────────────────────────────────────────────────────────"
echo

for ENDPOINT in "auth/register" "auth/login" "auth/me" "auth/logout" "user/status"; do
  echo "[OPTIONS] /$ENDPOINT"
  curl -s -o /dev/null -w "  → code=%{http_code}\n" -X OPTIONS \
       -H "Origin: http://localhost:3000" \
       -H "Access-Control-Request-Method: $( [ "$ENDPOINT" == "user/status" ] && echo GET || echo POST )" \
       -H "Access-Control-Request-Headers: Content-Type,Authorization" \
       "$API/$ENDPOINT"
done

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "2) TEST INSCRIPTION (POST /auth/register)"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X POST "$API/auth/register" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@example.com","password":"MonPass123"}'

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "3) TEST CONNEXION (POST /auth/login)"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X POST "$API/auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@example.com","password":"MonPass123"}' \
  -c "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "4) TEST /auth/me (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X GET "$API/auth/me" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "5) TEST /user/status (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X GET "$API/user/status" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "6) TEST /user/status/toggle (POST) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X POST "$API/user/status/toggle" \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"mediaType":"movie","mediaId":12345,"status":"WATCHED"}'

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "7) TEST /user/status/:mediaType/:mediaId (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X GET "$API/user/status/movie/12345" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "8) TEST /user/status/:status/:mediaType/:mediaId (DELETE) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X DELETE "$API/user/status/WATCHED/movie/12345" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "9) TEST DÉCONNEXION (POST /auth/logout) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X POST "$API/auth/logout" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "10) TEST /auth/me APRÈS LOGOUT (GET) — DOIT RENVOYER 401"
echo "────────────────────────────────────────────────────────────────────────"
echo
curl -s -i -X GET "$API/auth/me" \
  -H "Origin: http://localhost:3000" \
  -b "$COOKIE_FILE"

echo
echo "────────────────────────────────────────────────────────────────────────"
echo "✓ Tous les tests ont été exécutés"
echo "────────────────────────────────────────────────────────────────────────"
echo

# Nettoyage
rm -f "$COOKIE_FILE"
