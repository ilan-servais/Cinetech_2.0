import Image from 'next/image';
import React from 'react';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface StreamingProvidersProps {
  providers: Provider[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showRemainingCount?: boolean;
}

/**
 * Normalise le nom du provider pour en extraire le nom principal de la plateforme
 * Exemples:
 * - "Netflix Standard With Ads" → "netflix"
 * - "Paramount+ with Showtime" → "paramount plus"
 * - "Amazon Prime Video" → "prime video"
 */
function normalizeProviderName(name: string): string {
  if (!name) return '';
  
  // Convertir en minuscules
  let normalized = name.toLowerCase();
  
  // Remplacer les caractères spéciaux par leur équivalent texte
  normalized = normalized.replace(/\+/g, ' plus');
  
  // Remplacements spécifiques pour certaines plateformes
  const replacements: Record<string, string> = {
    'netflix standard with ads': 'netflix',
    'netflix basic with ads': 'netflix',
    'netflix premium': 'netflix',
    'paramount plus with showtime': 'paramount plus',
    'paramount plus on apple tv': 'paramount plus',
    'paramount plus premium': 'paramount plus',
    'max amazon channel': 'max',
    'hbo max': 'max',
    'hbo max free': 'max',
    'amazon prime video': 'prime video',
    'amazon video': 'prime video',
    'amazon prime': 'prime video',
    'canal plus': 'canal+',
    'canal +': 'canal+',
    'disney plus': 'disney+',
    'disney +': 'disney+',
    'apple tv plus': 'apple tv+',
    'apple tv +': 'apple tv+'
  };
  
  // Appliquer les remplacements spécifiques
  for (const [pattern, replacement] of Object.entries(replacements)) {
    if (normalized.includes(pattern)) {
      return replacement;
    }
  }
  
  // Supprimer les qualificatifs communs (with, on, premium, standard, etc.)
  const removeWords = ['with', 'on', 'premium', 'standard', 'basic', 'free', 'ads', 'amazon channel'];
  for (const word of removeWords) {
    normalized = normalized.replace(new RegExp(`\\s${word}\\s`, 'g'), ' ');
  }
  
  // Supprimer les espaces multiples et nettoyer
  return normalized.replace(/\s+/g, ' ').trim();
}

const StreamingProviders: React.FC<StreamingProvidersProps> = ({ 
  providers, 
  size = 'md', 
  maxDisplay = 3, 
  showRemainingCount = false 
}) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  const sizesMap = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  // Dédoublonner les plateformes en utilisant les noms normalisés
  const uniqueProviders = providers.reduce((acc: Provider[], current) => {
    // Obtenir le nom normalisé pour le provider actuel
    const normalizedName = normalizeProviderName(current.provider_name);
    
    // Vérifier si un provider avec ce nom normalisé existe déjà dans notre tableau
    const exists = acc.some(item => 
      normalizeProviderName(item.provider_name) === normalizedName
    );
    
    if (!exists) {
      // Si ce provider n'existe pas encore (nom normalisé), l'ajouter
      acc.push(current);
    }
    return acc;
  }, []);

  const iconSize = sizesMap[size];
  const displayProviders = uniqueProviders.slice(0, maxDisplay);
  const remainingCount = uniqueProviders.length - maxDisplay;
  
  // Debug logging en mode développement
  if (process.env.NODE_ENV === 'development') {
    // Afficher les providers avant et après normalisation (aide au débogage)
    const providersWithNormalizedNames = providers.map(p => ({
      ...p,
      normalized_name: normalizeProviderName(p.provider_name)
    }));
    
    if (providers.length !== uniqueProviders.length) {
      console.log('📊 StreamingProviders - Dédoublonnage effectué:');
      console.log('📊 Original:', providersWithNormalizedNames);
      console.log('📊 Unique:', uniqueProviders.map(p => ({
        ...p,
        normalized_name: normalizeProviderName(p.provider_name)
      })));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayProviders.map((provider) => (
        <div
          key={provider.provider_id}
          className="relative rounded-full overflow-hidden"
          style={{ width: iconSize, height: iconSize }}
          title={provider.provider_name}
          data-normalized-name={normalizeProviderName(provider.provider_name)}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            width={iconSize}
            height={iconSize}
            className="object-cover"
          />
        </div>
      ))}
      
      {showRemainingCount && remainingCount > 0 && (
        <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 dark:text-textLight py-0.5 px-2 rounded-full">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default StreamingProviders;
