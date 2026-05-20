import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { ItemListe } from '../types';
import { Button } from '../components/ui/button';

export default function ApercuImpression() {
  const navigate = useNavigate();
  const [liste, setListe] = useState<ItemListe[]>([]);

  useEffect(() => {
    window.api.getListeCourses().then(l => setListe(l as ItemListe[]));
  }, []);

  const total = liste.reduce((sum, i) => sum + i.prix * i.quantite, 0);

  // Tri pour l'impression uniquement par nom de rayon parsé :
  // "1" < "2" < "2a" < "2B" < "02" (tous traités comme 2) < "11" < "11a"
  // Les produits sans rayon vont à la fin, puis tri alphabétique sur le produit
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
    <div className="min-h-screen bg-gray-100">
      {/* Barre d'outils — masquée à l'impression */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/liste')}>
          <ArrowLeft size={14} className="mr-1" /> Retour
        </Button>
        <span className="text-sm text-gray-500">Aperçu avant impression</span>
        <Button size="sm" onClick={() => window.print()} className="ml-auto">
          <Printer size={14} className="mr-1" /> Imprimer
        </Button>
      </div>

      {/* Feuille A4 simulée */}
      <div className="print:p-0 p-8 flex justify-center">
        <div
          className="bg-white shadow-lg print:shadow-none"
          style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}
        >
          {/* En-tête */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-bold">Liste de Courses</h1>
            <div className="text-right text-sm text-gray-500">
              <div>{new Date().toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div>{liste.length} articles</div>
            </div>
          </div>
          <hr className="border-gray-300 mb-6" />

          {/* Liste en 2 colonnes — remplit la 1ère colonne de haut en bas, puis la 2ème */}
          <div style={{ columnCount: 2, columnGap: '20mm', columnFill: 'auto', height: '220mm' }}>
            {listeTrie.map(item => (
              <div
                key={item.id}
                style={{ breakInside: 'avoid' }}
                className="flex items-start gap-2 py-1 text-sm border-b border-dotted border-gray-200"
              >
                <span className="flex-1">
                  {item.quantite > 1 && <span className="font-semibold">{item.quantite}× </span>}
                  {item.produit_nom}
                  {item.rayon_nom && (
                    <span className="text-gray-400 text-xs ml-1">({item.rayon_nom})</span>
                  )}
                </span>
                {item.prix > 0 && (
                  <span className="text-gray-400 text-xs shrink-0">
                    {(item.prix * item.quantite).toFixed(2)}€
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-8 pt-3 border-t border-gray-300 flex justify-end text-sm font-semibold">
            Total estimé : {total.toFixed(2)} €
          </div>
        </div>
      </div>
    </div>
  );
}
