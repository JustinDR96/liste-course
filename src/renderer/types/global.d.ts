export {};

declare global {
  interface Window {
    api: {
      getRayons: () => Promise<any[]>;
      createRayon: (nom: string, ordre?: number) => Promise<number>;
      updateRayon: (id: number, nom: string) => Promise<void>;
      updateRayonNom: (id: number, nom: string) => Promise<void>;
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
      updatePrixListe: (id: number, prix: number) => Promise<void>;
      supprimerDeListe: (id: number) => Promise<void>;
      viderListe: () => Promise<void>;
      sauvegarderListe: (nom: string) => Promise<number>;
      getListesSauvegardees: () => Promise<any[]>;
      getListeSauvegardeeItems: (liste_id: number) => Promise<any[]>;
      supprimerListeSauvegardee: (id: number) => Promise<void>;
      chargerListeSauvegardee: (id: number) => Promise<void>;
      getStatsBudgetMensuel: () => Promise<any[]>;
      getStatsProduitsFréquents: () => Promise<any[]>;
      getStatsGlobal: () => Promise<any[]>;
      getStatsRayons: () => Promise<any[]>;
      getStatsTopBudget: () => Promise<any[]>;
      importerExcel: () => Promise<{ canceled: boolean; rayons?: number; produits?: number }>;
      print: () => Promise<void>;
      printToPdf: () => Promise<void>;
      onUpdateAvailable: (cb: (info: { version: string; url: string }) => void) => void;
      openUrl: (url: string) => Promise<void>;
    };
  }
}
