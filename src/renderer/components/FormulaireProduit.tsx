import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Rayon } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';

const NOUVEAU_RAYON = '__nouveau__';

interface Props {
  rayons: Rayon[];
  onAjouter: (nom: string, prix: number, rayon_id: number | null) => void;
  onRayonCree: (rayon: Rayon) => void;
}

export default function FormulaireProduit({ rayons, onAjouter, onRayonCree }: Props) {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [rayonId, setRayonId] = useState<string>('');
  const [nouveauRayon, setNouveauRayon] = useState('');
  const [loading, setLoading] = useState(false);

  const creerNouveauRayon = rayonId === NOUVEAU_RAYON;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    setLoading(true);

    let finalRayonId: number | null = null;

    // Créer le rayon à la volée si nécessaire
    if (creerNouveauRayon && nouveauRayon.trim()) {
      const id = await window.api.createRayon(nouveauRayon.trim(), rayons.length);
      const nouveauxRayons = await window.api.getRayons();
      const rayon = (nouveauxRayons as Rayon[]).find(r => r.id === id);
      if (rayon) onRayonCree(rayon);
      finalRayonId = id as number;
    } else if (rayonId) {
      finalRayonId = Number(rayonId);
    }

    await onAjouter(nom.trim(), parseFloat(prix) || 0, finalRayonId);

    // Reset
    setNom('');
    setPrix('');
    setRayonId('');
    setNouveauRayon('');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Ajouter un produit</h2>
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Nom du produit *"
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="flex-1 min-w-40"
          required
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Prix (€)"
          value={prix}
          onChange={e => setPrix(e.target.value)}
          className="w-28"
        />
        <select
          value={rayonId}
          onChange={e => setRayonId(e.target.value)}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <option value="">Sans rayon</option>
          {rayons.map(r => (
            <option key={r.id} value={r.id}>{r.nom}</option>
          ))}
          <option value={NOUVEAU_RAYON}>+ Créer un nouveau rayon...</option>
        </select>

        {creerNouveauRayon && (
          <Input
            placeholder="Nom du nouveau rayon *"
            value={nouveauRayon}
            onChange={e => setNouveauRayon(e.target.value)}
            className="w-48"
            required
            autoFocus
          />
        )}

        <Button type="submit" disabled={loading}>
          <Plus size={15} className="mr-1" />
          Ajouter
        </Button>
      </div>
    </form>
  );
}
