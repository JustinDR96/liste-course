import React, { useState } from 'react';
import { Trash2, Minus, Plus, Pencil, Check, X } from 'lucide-react';
import { ItemListe as ItemListeType } from '../types';
import { Button } from './ui/button';

interface Props {
  item: ItemListeType;
  onQuantite: (id: number, quantite: number) => void;
  onSupprimer: (id: number) => void;
  onPrix: (id: number, prix: number) => void;
}

export default function ItemListe({ item, onQuantite, onSupprimer, onPrix }: Props) {
  const [editPrix, setEditPrix] = useState(false);
  const [prixVal, setPrixVal] = useState(item.prix.toFixed(2));

  function handlePrixConfirm() {
    const p = parseFloat(prixVal);
    if (!isNaN(p) && p >= 0) onPrix(item.id, p);
    setEditPrix(false);
  }

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
      {editPrix ? (
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={prixVal}
            onChange={e => setPrixVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handlePrixConfirm(); if (e.key === 'Escape') setEditPrix(false); }}
            className="w-14 text-right text-sm font-medium bg-transparent focus:outline-none text-blue-700"
            autoFocus
          />
          <span className="text-sm text-blue-400 font-medium">€</span>
          <button onClick={handlePrixConfirm} className="text-green-500 hover:text-green-600">
            <Check size={14} />
          </button>
          <button onClick={() => setEditPrix(false)} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-600 w-16 text-right">
            {(item.prix * item.quantite).toFixed(2)} €
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            onClick={() => { setPrixVal(item.prix.toFixed(2)); setEditPrix(true); }}
            title="Modifier le prix pour cette liste"
          >
            <Pencil size={13} />
          </Button>
        </div>
      )}

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
