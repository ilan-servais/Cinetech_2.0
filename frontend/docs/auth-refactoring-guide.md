/**
 * 📋 GUIDE DE REFACTORISATION - AUTHCONTEXT OPTIMAL
 * 
 * Ce fichier documente les meilleures pratiques pour utiliser
 * l'AuthContext de manière optimale dans l'application.
 */

// ❌ ANTI-PATTERN : Fetch direct dans un composant
// export default function MyComponent() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   
//   useEffect(() => {
//     fetch('/api/auth/me')
//       .then(res => res.json())
//       .then(setUser)
//       .finally(() => setLoading(false));
//   }, []);
// }

// ✅ BONNE PRATIQUE : Utiliser uniquement le context
export default function MyComponent() {
  const { user, loading, initialized } = useAuth();
  const hasMounted = useHasMounted();

  // Attendre que tout soit prêt
  if (!hasMounted || !initialized || loading) {
    return <LoadingSpinner />;
  }

  return <div>Utilisateur: {user?.email}</div>;
}

// ✅ ENCORE MIEUX : Utiliser les hooks utilitaires
export default function MyComponentOptimal() {
  const { isReady, canAccess, user } = useAuthStatus();

  if (!isReady) return <LoadingSpinner />;
  if (!canAccess) return <AuthGuard />;

  return <div>Contenu protégé pour {user.email}</div>;
}

// ✅ PARFAIT : Utiliser AuthGuard pour les pages protégées
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div className="container">
        <h1>Page protégée</h1>
        <UserProfile />
        <ProtectedContent />
      </div>
    </AuthGuard>
  );
}

/**
 * 🎯 RÈGLES D'OR :
 * 
 * 1. UN SEUL AuthProvider au niveau racine (app/layout.tsx) ✅
 * 2. UN SEUL fetch /api/auth/me dans toute l'app (AuthContext) ✅
 * 3. JAMAIS de redirection si loading=true ✅
 * 4. TOUJOURS attendre initialized=true ✅
 * 5. UTILISER useAuthStatus() pour simplifier ✅
 * 6. UTILISER AuthGuard pour les pages protégées ✅
 * 7. LOGS détaillés pour debugging ✅
 */

/**
 * 🔧 MIGRATION DES COMPOSANTS EXISTANTS :
 * 
 * 1. Remplacer tous les fetch('/api/auth/me') par useAuth()
 * 2. Ajouter la vérification initialized dans les conditions
 * 3. Utiliser useAuthStatus() pour simplifier la logique
 * 4. Wrapper les pages protégées avec AuthGuard
 * 5. Supprimer les états auth locaux (useState)
 */

/**
 * 🐛 DEBUGGING :
 * 
 * Vérifier les logs dans la console :
 * - [AuthProvider] Provider mounted
 * - [AuthProvider] Fetching current user... (UNIQUE)
 * - [AuthProvider] Loading completed. Ready for component access.
 * - [AuthGuard] State: { initialized: true, isAuthenticated: true }
 * 
 * Si vous voyez plusieurs "Fetching current user", il y a un problème !
 */
