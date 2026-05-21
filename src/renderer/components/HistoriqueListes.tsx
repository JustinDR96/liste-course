import React, { useEffect, useState } from 'react';
import { X, Trash2, ChevronDown, ChevronRight, ShoppingBag, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useDialog } from './ui/dialog';

interface ListeSauvegardee {
  id: number;
  nom: string;
  date_creation: string;
  total: number;
}

interface ItemSauvegarde {
  id: number;
  produit_nom: string;
  quantite: number;
  prix: number;
  rayon_nom: string | null;
}

interface Props {
  onClose: () => void;
  onCharger: (id: number) => void;
}

export default function HistoriqueListes({ onClose, onCharger }: Props) {
  const { confirm } = useDialog();
  const [listes, setListes] = useState<ListeSauvegardee[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [items, setItems] = useState<Record<number, ItemSauvegarde[]>>({});

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const l = await window.api.getListesSauvegardees();
    setListes(l as ListeSauvegardee[]);
  }

  async function handleExpand(id: number) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!items[id]) {
      const its = await window.api.getListeSauvegardeeItems(id);
      setItems(prev => ({ ...prev, [id]: its as ItemSauvegarde[] }));
    }
  }

  async function handleSupprimer(id: number) {
    const ok = await confirm({ title: 'Supprimer la liste', message: 'Cette liste sauvegardée sera définitivement supprimée.', confirmLabel: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    await window.api.supprimerListeSauvegardee(id);
    setListes(prev => prev.filter(l => l.id !== id));
    if (expanded === id) setExpanded(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <ShoppingBag size={18} className="text-blue-600" />
            Listes sauvegardées
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {listes.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              Aucune liste sauvegardée pour l'instant.
            </div>
          )}
          {listes.map(liste => (
            <div key={liste.id}>
              <div className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => handleExpand(liste.id)}>
                <span className="text-gray-400">
                  {expanded === liste.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{liste.nom}</p>
                  <p className="text-xs text-gray-400">{formatDate(liste.date_creation)}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600 shrink-0">{liste.total.toFixed(2)} €</span>
                <button
                  onClick={e => { e.stopPropagation(); onCharger(liste.id); }}
                  className="text-gray-300 hover:text-blue-500 transition-colors ml-1"
                  title="Charger cette liste"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleSupprimer(liste.id); }}
                  className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {expanded === liste.id && items[liste.id] && (
                <div className="bg-gray-50 px-5 pb-3">
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                    {items[liste.id].map(item => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-white text-sm">
                        <div>
                          <span className="text-gray-800">{item.quantite > 1 ? `${item.quantite}× ` : ''}{item.produit_nom}</span>
                          {item.rayon_nom && <span className="ml-2 text-xs text-gray-400">{item.rayon_nom}</span>}
                        </div>
                        <span className="text-gray-500 text-xs">{(item.prix * item.quantite).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100">
          <Button variant="outline" size="sm" className="w-full" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
