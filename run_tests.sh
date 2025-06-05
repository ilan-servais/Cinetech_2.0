#!/usr/bin/env bash
#
# run_tests.sh
# Script pour exécuter tous les tests curl d’un coup
#

FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:3001/api"
COOKIE_FILE="cookies.txt"

# Supprimer l’ancien cookie pour être certain de repartir à zéro
rm -f "$COOKIE_FILE"

echo "────────────────────────────────────────────────────────────────────────"
echo " 1) TEST PRÉ-VOLS CORS (OPTIONS) SUR LES ENDPOINTS PUBLICS"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
echo "[1.1] OPTIONS /auth/register"
curl -i -X OPTIONS "$API_URL/auth/register" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
echo -e "\n\n"

echo "[1.2] OPTIONS /auth/login"
curl -i -X OPTIONS "$API_URL/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
echo -e "\n\n"

echo "[1.3] OPTIONS /auth/me"
curl -i -X OPTIONS "$API_URL/auth/me" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
echo -e "\n\n"

echo "[1.4] OPTIONS /auth/logout"
curl -i -X OPTIONS "$API_URL/auth/logout" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
echo -e "\n\n"

echo "[1.5] OPTIONS /user/status"
curl -i -X OPTIONS "$API_URL/user/status" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 2) TEST INSCRIPTION (POST /auth/register)"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X POST "$API_URL/auth/register" \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"nouvel@example.com","password":"MonMotDePasse123"}'
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 3) TEST CONNEXION (POST /auth/login)"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X POST "$API_URL/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"nouvel@example.com","password":"MonMotDePasse123"}' \
  -c "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 4) TEST /auth/me (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X GET "$API_URL/auth/me" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 5) TEST /user/status (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X GET "$API_URL/user/status" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 6) TEST /user/status/toggle (POST) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X POST "$API_URL/user/status/toggle" \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"mediaType":"movie","mediaId":12345,"status":"watched"}' \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 7) TEST /user/status/:mediaType/:mediaId (GET) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X GET "$API_URL/user/status/movie/12345" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 8) TEST /user/status/:status/:mediaType/:mediaId (DELETE) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X DELETE "$API_URL/user/status/watched/movie/12345" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo " 9) TEST DÉCONNEXION (POST /auth/logout) AVEC COOKIE"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X POST "$API_URL/auth/logout" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo "10) TEST /auth/me APRÈS LOGOUT (GET) — DOIT RENVOYER 401"
echo "────────────────────────────────────────────────────────────────────────"
echo ""
curl -i -X GET "$API_URL/auth/me" \
  -H "Origin: $FRONTEND_URL" \
  -b "$COOKIE_FILE"
echo -e "\n\n"


echo "────────────────────────────────────────────────────────────────────────"
echo "Terminé ! (Le cookie a été supprimé, toutes les étapes ont été exécutées.)"
echo "────────────────────────────────────────────────────────────────────────"
