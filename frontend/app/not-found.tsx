import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-default min-h-[70vh] flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text mb-6">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Page non trouvée</h2>
      <p className="text-center mb-8 max-w-md dark:text">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link 
          href="/" 
          className="btn-primary"
        >
          Retour à l'accueil
        </Link>
        <Link 
          href="/search" 
          className="btn-secondary"
        >
          Rechercher un contenu
        </Link>
      </div>
    </div>
  );
}
