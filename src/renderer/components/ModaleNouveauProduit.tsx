import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Rayon } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface Props {
  nomInitial?: string;
  onCreer: (nom: string, prix: number, rayon_id: number | null) => void;
  onClose: () => void;
}

const NOUVEAU_RAYON = '__nouveau__';

export default function ModaleNouveauProduit({ nomInitial = '', onCreer, onClose }: Props) {
  const [nom, setNom] = useState(nomInitial);
  const [prix, setPrix] = useState('');
  const [rayonId, setRayonId] = useState('');
  const [nouveauRayon, setNouveauRayon] = useState('');
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.api.getRayons().then(r => setRayons(r as Rayon[]));
  }, []);

  const creerNouveauRayon = rayonId === NOUVEAU_RAYON;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    setLoading(true);

    let finalRayonId: number | null = null;

    if (creerNouveauRayon && nouveauRayon.trim()) {
      const id = await window.api.createRayon(nouveauRayon.trim(), rayons.length);
      finalRayonId = id as number;
    } else if (rayonId && rayonId !== NOUVEAU_RAYON) {
      finalRayonId = Number(rayonId);
    }

    await onCreer(nom.trim(), parseFloat(prix) || 0, finalRayonId);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Nouveau produit</h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 text-gray-400">
            <X size={15} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nom *</label>
            <Input
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Nom du produit"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Prix (€)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={prix}
              onChange={e => setPrix(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Rayon</label>
            <select
              value={rayonId}
              onChange={e => setRayonId(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <option value="">Sans rayon</option>
              {rayons.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nom}{r.label ? ` — ${r.label}` : ''}
                </option>
              ))}
              <option value={NOUVEAU_RAYON}>+ Créer un nouveau rayon...</option>
            </select>
          </div>

          {creerNouveauRayon && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Code du nouveau rayon *</label>
              <Input
                value={nouveauRayon}
                onChange={e => setNouveauRayon(e.target.value)}
                placeholder="ex: 23, 5b..."
                required
                autoFocus
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading || !nom.trim()}>
              Créer et ajouter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
