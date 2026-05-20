import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Produit } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface Props {
  produits: Produit[];
  onAjouter: (produit: Produit, quantite: number) => void;
  onNouveauProduit?: (query: string) => void;
}

export default function SearchBar({ produits, onAjouter, onNouveauProduit }: Props) {
  const [query, setQuery] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = query.trim().length > 0
    ? produits.filter(p => p.nom.toLowerCase().includes(query.toLowerCase()))
    : [];

  const aucunResultat = query.trim().length > 0 && suggestions.length === 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(produit: Produit) {
    onAjouter(produit, quantite);
    setQuery('');
    setQuantite(1);
    setShowSuggestions(false);
  }

  return (
    <div ref={ref} className="relative flex gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="Rechercher un produit..."
        />
        {query && (
          <span className="absolute right-3 top-2 text-xs text-gray-400">
            {suggestions.length} résultat{suggestions.length !== 1 ? 's' : ''}
          </span>
        )}

        {showSuggestions && (suggestions.length > 0 || aucunResultat) && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map(p => (
              <li
                key={p.id}
                onMouseDown={() => handleSelect(p)}
                className="flex justify-between items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                <span className="font-medium text-sm">{p.nom}</span>
                <span className="text-xs text-gray-400">{p.rayon_nom ?? 'Sans rayon'}</span>
              </li>
            ))}
            {aucunResultat && onNouveauProduit && (
              <li
                onMouseDown={() => { onNouveauProduit(query); setShowSuggestions(false); }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 cursor-pointer text-green-600 border-t border-gray-100"
              >
                <Plus size={13} />
                <span className="text-sm font-medium">Créer "{query}"</span>
              </li>
            )}
          </ul>
        )}
      </div>

      <Input
        type="number"
        min={1}
        value={quantite}
        onChange={e => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-16 text-center"
      />

      <Button variant="outline" onClick={() => suggestions[0] && handleSelect(suggestions[0])}>
        Ajouter
      </Button>
    </div>
  );
}
