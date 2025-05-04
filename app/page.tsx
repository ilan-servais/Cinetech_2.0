import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Bienvenue sur Cinetech 2.0</h1>
        <p className="text-lg mb-6">
          Découvrez les derniers films et séries, créez des listes personnalisées et plus encore...
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/trending"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Tendances
          </Link>
          <Link 
            href="/movies"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors"
          >
            Films
          </Link>
          <Link 
            href="/tv"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition-colors"
          >
            Séries
          </Link>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Fonctionnalités</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Recherche</h3>
            <p>Trouvez rapidement des films et des séries par titre, genre, ou acteur.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Favoris</h3>
            <p>Créez votre liste personnalisée de films et séries favoris.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Tendances</h3>
            <p>Restez à jour avec les contenus les plus populaires du moment.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
