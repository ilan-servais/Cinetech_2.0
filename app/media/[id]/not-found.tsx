import Link from 'next/link';

export default function MediaNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Contenu non trouvé</h1>
      <p className="mb-6 text-center">
        Le film ou la série que vous recherchez n'existe pas ou n'est plus disponible.
      </p>
      <Link 
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
