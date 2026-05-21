import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { Rayon, Produit } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useDialog } from '../components/ui/dialog';

interface PopupProduitsProps {
  rayon: Rayon;
  onClose: () => void;
}

function PopupProduits({ rayon, onClose }: PopupProduitsProps) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.getProduitsParRayon(rayon.id).then(p => {
      setProduits(p as Produit[]);
      setLoading(false);
    });
  }, [rayon.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-mono text-gray-400 mr-2">{rayon.nom}</span>
            <span className="text-base font-semibold text-gray-800">
              {rayon.label || 'Sans nom'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{produits.length} produit{produits.length !== 1 ? 's' : ''}</Badge>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 text-gray-400">
              <X size={15} />
            </Button>
          </div>
        </div>

        {/* Liste produits */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-8">Chargement...</p>
          )}
          {!loading && produits.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 italic">Aucun produit dans ce rayon.</p>
          )}
          {produits.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
              <span className="text-sm text-gray-800">{p.nom}</span>
              <span className="text-sm text-gray-400">{p.prix.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Rayons() {
  const { confirm } = useDialog();
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [enEdition, setEnEdition] = useState<number | null>(null);
  const [valeurEdition, setValeurEdition] = useState('');
  const [codeEdition, setCodeEdition] = useState('');
  const [nouveauNom, setNouveauNom] = useState('');
  const [rayonSelectionne, setRayonSelectionne] = useState<Rayon | null>(null);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const r = await window.api.getRayons();
    setRayons(r as Rayon[]);
  }

  function startEdit(e: React.MouseEvent, rayon: Rayon) {
    e.stopPropagation();
    setEnEdition(rayon.id);
    setValeurEdition(rayon.label ?? '');
    setCodeEdition(rayon.nom);
  }

  async function saveEdit(id: number) {
    const newCode = codeEdition.trim();
    const newLabel = valeurEdition.trim();
    if (newCode) await window.api.updateRayonNom(id, newCode);
    await window.api.updateRayon(id, newLabel);
    setRayons(prev => prev.map(r => r.id === id ? { ...r, nom: newCode || r.nom, label: newLabel } : r));
    setEnEdition(null);
    toast.success('Rayon mis à jour');
  }

  async function handleDelete(e: React.MouseEvent, rayon: Rayon) {
    e.stopPropagation();
    const count = await window.api.countProduitsInRayon(rayon.id) as unknown as number;
    const msg = count > 0
      ? `Les ${count} produit(s) liés à ce rayon seront détachés mais pas supprimés.`
      : `Cette action est irréversible.`;
    const ok = await confirm({ title: `Supprimer le rayon "${rayon.nom}" ?`, message: msg, confirmLabel: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    await window.api.deleteRayon(rayon.id);
    setRayons(prev => prev.filter(r => r.id !== rayon.id));
    toast(`Rayon "${rayon.nom}" supprimé`, {
      action: {
        label: 'Restaurer',
        onClick: async () => {
          await window.api.createRayon(rayon.nom, rayon.numero_ordre);
          await charger();
        },
      },
    });
  }

  async function handleAjouter(e: React.FormEvent) {
    e.preventDefault();
    if (!nouveauNom.trim()) return;
    await window.api.createRayon(nouveauNom.trim(), rayons.length);
    setNouveauNom('');
    await charger();
    toast.success(`Rayon "${nouveauNom.trim()}" ajouté`);
  }

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline">{rayons.length} rayons</Badge>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Formulaire ajout rayon */}
        <form onSubmit={handleAjouter} className="flex gap-2 mb-6">
          <Input
            placeholder="Code du nouveau rayon (ex: 22, 5a...)"
            value={nouveauNom}
            onChange={e => setNouveauNom(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!nouveauNom.trim()}>
            <Plus size={14} className="mr-1" /> Ajouter
          </Button>
        </form>

        {/* Liste */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          <div className="grid grid-cols-[80px_1fr_100px] px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Code</span>
            <span>Nom</span>
          </div>

          {rayons.map(rayon => (
            <div
              key={rayon.id}
              className="grid grid-cols-[80px_1fr_100px] items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => enEdition !== rayon.id && setRayonSelectionne(rayon)}
            >
              {enEdition === rayon.id ? (
                <div className="col-span-2 flex gap-2 pr-2" onClick={e => e.stopPropagation()}>
                  <Input
                    value={codeEdition}
                    onChange={e => setCodeEdition(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(rayon.id);
                      if (e.key === 'Escape') setEnEdition(null);
                    }}
                    placeholder="Code..."
                    className="h-7 text-sm font-mono w-24 shrink-0"
                    autoFocus
                  />
                  <Input
                    value={valeurEdition}
                    onChange={e => setValeurEdition(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit(rayon.id);
                      if (e.key === 'Escape') setEnEdition(null);
                    }}
                    placeholder="Nom du rayon..."
                    className="h-7 text-sm flex-1"
                  />
                </div>
              ) : (
                <>
                  <span className="text-sm font-mono text-gray-400">{rayon.nom}</span>
                  <span className="text-sm text-gray-700">
                    {rayon.label || <span className="text-gray-300 italic">— sans nom</span>}
                  </span>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                {enEdition === rayon.id ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); saveEdit(rayon.id); }} className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Check size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setEnEdition(null); }} className="h-7 w-7 text-gray-500 hover:text-gray-700">
                      <X size={14} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" onClick={e => startEdit(e, rayon)} className="h-7 w-7 text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={e => handleDelete(e, rayon)} className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {rayonSelectionne && (
        <PopupProduits
          rayon={rayonSelectionne}
          onClose={() => setRayonSelectionne(null)}
        />
      )}
    </div>
  );
}
