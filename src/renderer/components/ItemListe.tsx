import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { ItemListe as ItemListeType } from '../types';
import { Button } from './ui/button';

interface Props {
  item: ItemListeType;
  onQuantite: (id: number, quantite: number) => void;
  onSupprimer: (id: number) => void;
}

export default function ItemListe({ item, onQuantite, onSupprimer }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50/60 transition-colors">
      {/* Nom + rayon */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm text-gray-800">{item.produit_nom}</span>
        {item.rayon_nom && (
          <span className="ml-2 text-xs text-gray-400">Rayon {item.rayon_nom}</span>
        )}
      </div>

      {/* Contrôle quantité */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={() => item.quantite > 1 ? onQuantite(item.id, item.quantite - 1) : onSupprimer(item.id)}
        >
          <Minus size={11} />
        </Button>
        <span className="w-6 text-center text-sm font-medium">{item.quantite}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={() => onQuantite(item.id, item.quantite + 1)}
        >
          <Plus size={11} />
        </Button>
      </div>

      {/* Prix */}
      <span className="text-sm font-medium text-gray-600 w-16 text-right">
        {(item.prix * item.quantite).toFixed(2)} €
      </span>

      {/* Supprimer */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSupprimer(item.id)}
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
