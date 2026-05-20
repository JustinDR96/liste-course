export interface Rayon {
  id: number;
  nom: string;       // code immuable (ex: "14c")
  label?: string;    // nom lisible optionnel (ex: "Produits laitiers")
  numero_ordre: number;
}

export interface Produit {
  id: number;
  nom: string;
  prix: number;
  rayon_id: number | null;
  rayon_nom?: string;
  numero_ordre?: number;
}

export interface ItemListe {
  id: number;
  produit_id: number;
  produit_nom: string;
  prix: number;
  quantite: number;
  coche: number; // 0 = à acheter, 1 = dans le caddie
  rayon_nom?: string;
  numero_ordre?: number;
}
