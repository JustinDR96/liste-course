import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Printer, Trash2, Save, History, Plus } from 'lucide-react';
import { Produit, ItemListe } from '../types';
import SearchBar from '../components/SearchBar';
import ItemListeComponent from '../components/ItemListe';
import HistoriqueListes from '../components/HistoriqueListes';
import ModaleNouveauProduit from '../components/ModaleNouveauProduit';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useDialog } from '../components/ui/dialog';

export default function ListeCourses() {
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const [showNouveauProduit, setShowNouveauProduit] = useState(false);
  const [queryPourNouveauProduit, setQueryPourNouveauProduit] = useState('');
  const [produits, setProduits] = useState<Produit[]>([]);
  const [liste, setListe] = useState<ItemListe[]>([]);
  const [showHistorique, setShowHistorique] = useState(false);
  const [showSauvegardeModal, setShowSauvegardeModal] = useState(false);
  const [nomSauvegarde, setNomSauvegarde] = useState('');

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    const [p, l] = await Promise.all([
      window.api.getProduits(),
      window.api.getListeCourses(),
    ]);
    setProduits(p as Produit[]);
    setListe(l as ItemListe[]);
  }

  async function handleAjouter(produit: Produit, quantite: number) {
    await window.api.ajouterAListe(produit.id, quantite);
    const l = await window.api.getListeCourses();
    setListe(l as ItemListe[]);
  }

  async function handleCreerProduit(nom: string, prix: number, rayon_id: number | null) {
    const id = await window.api.createProduit(nom, prix, rayon_id);
    await window.api.ajouterAListe(id as number, 1);
    await chargerDonnees();
  }

  async function handleQuantite(id: number, quantite: number) {
    await window.api.updateQuantite(id, quantite);
    setListe(prev => prev.map(i => i.id === id ? { ...i, quantite } : i));
  }

  async function handleSupprimer(id: number) {
    await window.api.supprimerDeListe(id);
    setListe(prev => prev.filter(i => i.id !== id));
  }

  async function handleVider() {
    const ok = await confirm({ title: 'Vider la liste', message: 'Supprimer tous les produits de la liste ?', confirmLabel: 'Vider', variant: 'destructive' });
    if (!ok) return;
    await window.api.viderListe();
    setListe([]);
  }

  function handleOuvrirSauvegarde() {
    const now = new Date();
    const defaultNom = `Courses du ${now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    setNomSauvegarde(defaultNom);
    setShowSauvegardeModal(true);
  }

  async function handleSauvegarder() {
    if (!nomSauvegarde.trim()) return;
    await window.api.sauvegarderListe(nomSauvegarde.trim());
    setShowSauvegardeModal(false);
  }

  const total = liste.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  const nbCoches = liste.length;

  // Tri pour la vue impression uniquement (même logique que ApercuImpression)
  function parseRayon(nom: string | undefined): [number, string] {
    if (!nom) return [Infinity, ''];
    const match = nom.trim().match(/^0*(\d+)([a-zA-Z]*)$/);
    if (!match) return [Infinity, nom.toLowerCase()];
    return [parseInt(match[1], 10), match[2].toLowerCase()];
  }

  const listeTrie = [...liste].sort((a, b) => {
    const [numA, letA] = parseRayon(a.rayon_nom);
    const [numB, letB] = parseRayon(b.rayon_nom);
    if (numA !== numB) return numA - numB;
    if (letA !== letB) return letA.localeCompare(letB, 'fr');
    return a.produit_nom.localeCompare(b.produit_nom, 'fr');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-end gap-2">
          {liste.length > 0 && (
            <Badge variant="default">{nbCoches}/{liste.length}</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowHistorique(true)}>
            <History size={15} className="mr-1" /> Historique
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/apercu')} disabled={liste.length === 0}>
            <Printer size={15} className="mr-1" /> Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleOuvrirSauvegarde} disabled={liste.length === 0}>
            <Save size={15} className="mr-1" /> Sauvegarder
          </Button>
          <Button variant="destructive" size="sm" onClick={handleVider} disabled={liste.length === 0}>
            <Trash2 size={15} className="mr-1" /> Vider
          </Button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Barre de recherche */}
        <div className="mb-6 print:hidden flex gap-2">
          <div className="flex-1">
            <SearchBar produits={produits} onAjouter={handleAjouter} onNouveauProduit={(query) => { setQueryPourNouveauProduit(query); setShowNouveauProduit(true); }} />
          </div>
          <Button variant="outline" size="icon" onClick={() => { setQueryPourNouveauProduit(''); setShowNouveauProduit(true); }} title="Créer un nouveau produit">
            <Plus size={16} />
          </Button>
        </div>

        {/* Liste vide */}
        {liste.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p>La liste est vide. Recherchez un produit ci-dessus.</p>
          </div>
        )}

        {/* Liste complète */}
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {liste.map(item => (
            <ItemListeComponent
              key={item.id}
              item={item}
              onQuantite={handleQuantite}
              onSupprimer={handleSupprimer}
            />
          ))}
        </div>

        {/* Total */}
        {liste.length > 0 && (
          <div className="mt-6 flex justify-end print:hidden">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700">
              Total estimé : <span className="text-blue-600 font-semibold">{total.toFixed(2)} €</span>
            </div>
          </div>
        )}
      </main>

      {/* Vue impression 2 colonnes */}
      <div className="hidden print:block p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Liste de Courses</h1>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-BE')} — {liste.length} articles</span>
        </div>
        <hr className="mb-4 border-gray-300" />
        <div style={{ columnCount: 2, columnGap: '3rem' }}>
          {listeTrie.map(item => (
            <div key={item.id} style={{ breakInside: 'avoid' }} className="flex items-center gap-2 py-0.5 text-sm">
              <span className="inline-block w-3.5 h-3.5 border border-gray-500 shrink-0 mt-0.5" />
              <span className="flex-1">
                {item.quantite > 1 && <span className="font-medium">{item.quantite}× </span>}
                {item.produit_nom}
              </span>
              {item.prix > 0 && (
                <span className="text-gray-400 text-xs shrink-0">{(item.prix * item.quantite).toFixed(2)}€</span>
              )}
            </div>
          ))}
        </div>
        <hr className="mt-4 border-gray-300" />
        <div className="flex justify-end mt-2 text-sm font-semibold">
          Total estimé : {total.toFixed(2)} €
        </div>
      </div>

      {/* Modal sauvegarde */}
      {showSauvegardeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Sauvegarder la liste</h2>
            <input
              type="text"
              value={nomSauvegarde}
              onChange={e => setNomSauvegarde(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSauvegarder()}
              placeholder="Nom de la liste..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSauvegardeModal(false)}>Annuler</Button>
              <Button size="sm" onClick={handleSauvegarder} disabled={!nomSauvegarde.trim()}>
                <Save size={14} className="mr-1" /> Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal historique */}
      {showHistorique && (
        <HistoriqueListes onClose={() => setShowHistorique(false)} />
      )}

      {showNouveauProduit && (
        <ModaleNouveauProduit
          nomInitial={queryPourNouveauProduit}
          onCreer={handleCreerProduit}
          onClose={() => setShowNouveauProduit(false)}
        />
      )}
    </div>
  );
}
