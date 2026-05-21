import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Pencil, Trash2, FileUp } from 'lucide-react';
import { Produit, Rayon } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import FormulaireProduit from '../components/FormulaireProduit';
import { useDialog } from '../components/ui/dialog';

interface ModaleProps {
  produit: Produit;
  rayons: Rayon[];
  onSave: (nom: string, prix: number, rayon_id: number | null) => void;
  onClose: () => void;
}

function ModaleEdition({ produit, rayons, onSave, onClose }: ModaleProps) {
  const [nom, setNom] = useState(produit.nom);
  const [prix, setPrix] = useState(String(produit.prix));
  const [rayonId, setRayonId] = useState<number | null>(produit.rayon_id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(nom.trim(), parseFloat(prix) || 0, rayonId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Modifier le produit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nom</label>
            <Input value={nom} onChange={e => setNom(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Prix (€)</label>
            <Input type="number" step="0.01" min="0" value={prix} onChange={e => setPrix(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Rayon</label>
            <select
              value={rayonId ?? ''}
              onChange={e => setRayonId(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <option value="">Sans rayon</option>
              {rayons.map(r => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Produits() {
  const { confirm } = useDialog();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [query, setQuery] = useState('');
  const [enEdition, setEnEdition] = useState<Produit | null>(null);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const [p, r] = await Promise.all([window.api.getProduits(), window.api.getRayons()]);
    setProduits(p as Produit[]);
    setRayons(r as Rayon[]);
  }

  async function handleSave(nom: string, prix: number, rayon_id: number | null) {
    await window.api.updateProduit(enEdition!.id, nom, prix, rayon_id);
    setEnEdition(null);
    await charger();
    toast.success(`"${nom}" mis à jour`);
  }

  async function handleImportExcel() {
    const result = await window.api.importerExcel();
    if (result.canceled) return;
    await charger();
    toast.success(`Import terminé — ${result.produits} produits, ${result.rayons} rayons ajoutés`);
  }

  async function handleDelete(produit: Produit) {
    const ok = await confirm({ title: 'Supprimer le produit', message: `Supprimer "${produit.nom}" ?`, confirmLabel: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    await window.api.deleteProduit(produit.id);
    setProduits(prev => prev.filter(p => p.id !== produit.id));
    toast(`"${produit.nom}" supprimé`, {
      action: {
        label: 'Restaurer',
        onClick: async () => {
          await window.api.createProduit(produit.nom, produit.prix, produit.rayon_id ?? null);
          await charger();
        },
      },
    });
  }

  async function handleAjouter(nom: string, prix: number, rayon_id: number | null) {
    await window.api.createProduit(nom, prix, rayon_id);
    await charger();
    toast.success(`"${nom}" ajouté au catalogue`);
  }

  const filtres = produits.filter(p =>
    p.nom.toLowerCase().includes(query.toLowerCase()) ||
    (p.rayon_nom ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{produits.length} produits</Badge>
            <Button variant="outline" size="sm" onClick={handleImportExcel}>
              <FileUp size={14} className="mr-1" /> Importer Excel
            </Button>
          </div>
          <div className="relative w-72 ml-auto">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6">
        <FormulaireProduit
          rayons={rayons}
          onAjouter={handleAjouter}
          onRayonCree={r => setRayons(prev => [...prev, r])}
        />

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Rayon</th>
                <th className="px-4 py-3 text-right">Prix</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtres.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{p.nom}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{p.rayon_nom ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{p.prix.toFixed(2)} €</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => setEnEdition(p)}>
                        <Pencil size={14} className="text-gray-400 hover:text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtres.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Aucun produit trouvé pour "{query}"
            </div>
          )}
        </div>
      </main>

      {enEdition && (
        <ModaleEdition
          produit={enEdition}
          rayons={rayons}
          onSave={handleSave}
          onClose={() => setEnEdition(null)}
        />
      )}
    </div>
  );
}
