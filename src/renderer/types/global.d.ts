export {};

declare global {
  interface Window {
    api: {
      getRayons: () => Promise<any[]>;
      createRayon: (nom: string, ordre?: number) => Promise<number>;
      updateRayon: (id: number, nom: string) => Promise<void>;
      deleteRayon: (id: number) => Promise<void>;
      countProduitsInRayon: (id: number) => Promise<number>;
      getProduitsParRayon: (rayon_id: number) => Promise<any[]>;
      getProduits: () => Promise<any[]>;
      createProduit: (nom: string, prix: number, rayon_id: number | null) => Promise<number>;
      updateProduit: (id: number, nom: string, prix: number, rayon_id: number | null) => Promise<void>;
      deleteProduit: (id: number) => Promise<void>;
      getListeCourses: () => Promise<any[]>;
      ajouterAListe: (produit_id: number, quantite?: number) => Promise<number>;
      cocherProduit: (id: number, coche: boolean) => Promise<void>;
      updateQuantite: (id: number, quantite: number) => Promise<void>;
      supprimerDeListe: (id: number) => Promise<void>;
      viderListe: () => Promise<void>;
      sauvegarderListe: (nom: string) => Promise<number>;
      getListesSauvegardees: () => Promise<any[]>;
      getListeSauvegardeeItems: (liste_id: number) => Promise<any[]>;
      supprimerListeSauvegardee: (id: number) => Promise<void>;
      importerExcel: () => Promise<{ canceled: boolean; rayons?: number; produits?: number }>;
    };
  }
}
