import { contextBridge, ipcRenderer } from 'electron';

// Expose des fonctions sécurisées à React via window.api
contextBridge.exposeInMainWorld('api', {
  // Rayons
  getRayons: () => ipcRenderer.invoke('db:getRayons'),
  createRayon: (nom: string, ordre?: number) => ipcRenderer.invoke('db:createRayon', nom, ordre ?? 0),
  updateRayon: (id: number, nom: string) => ipcRenderer.invoke('db:updateRayon', id, nom),
  updateRayonNom: (id: number, nom: string) => ipcRenderer.invoke('db:updateRayonNom', id, nom),
  deleteRayon: (id: number) => ipcRenderer.invoke('db:deleteRayon', id),
  countProduitsInRayon: (id: number) => ipcRenderer.invoke('db:countProduitsInRayon', id),
  getProduitsParRayon: (rayon_id: number) => ipcRenderer.invoke('db:getProduitsParRayon', rayon_id),

  // Produits
  getProduits: () => ipcRenderer.invoke('db:getProduits'),
  createProduit: (nom: string, prix: number, rayon_id: number | null) =>
    ipcRenderer.invoke('db:createProduit', nom, prix, rayon_id),
  updateProduit: (id: number, nom: string, prix: number, rayon_id: number | null) =>
    ipcRenderer.invoke('db:updateProduit', id, nom, prix, rayon_id),
  deleteProduit: (id: number) => ipcRenderer.invoke('db:deleteProduit', id),

  // Liste de courses
  getListeCourses: () => ipcRenderer.invoke('db:getListeCourses'),
  ajouterAListe: (produit_id: number, quantite?: number) =>
    ipcRenderer.invoke('db:ajouterAListe', produit_id, quantite ?? 1),
  cocherProduit: (id: number, coche: boolean) => ipcRenderer.invoke('db:cocherProduit', id, coche),
  updateQuantite: (id: number, quantite: number) => ipcRenderer.invoke('db:updateQuantite', id, quantite),
  updatePrixListe: (id: number, prix: number) => ipcRenderer.invoke('db:updatePrixListe', id, prix),
  supprimerDeListe: (id: number) => ipcRenderer.invoke('db:supprimerDeListe', id),
  viderListe: () => ipcRenderer.invoke('db:viderListe'),

  // Listes sauvegardées
  sauvegarderListe: (nom: string) => ipcRenderer.invoke('db:sauvegarderListe', nom),
  getListesSauvegardees: () => ipcRenderer.invoke('db:getListesSauvegardees'),
  getListeSauvegardeeItems: (liste_id: number) => ipcRenderer.invoke('db:getListeSauvegardeeItems', liste_id),
  supprimerListeSauvegardee: (id: number) => ipcRenderer.invoke('db:supprimerListeSauvegardee', id),
  chargerListeSauvegardee: (id: number) => ipcRenderer.invoke('db:chargerListeSauvegardee', id),

  getStatsBudgetMensuel: () => ipcRenderer.invoke('db:getStatsBudgetMensuel'),
  getStatsProduitsFréquents: () => ipcRenderer.invoke('db:getStatsProduitsFréquents'),
  getStatsGlobal: () => ipcRenderer.invoke('db:getStatsGlobal'),
  getStatsRayons: () => ipcRenderer.invoke('db:getStatsRayons'),
  getStatsTopBudget: () => ipcRenderer.invoke('db:getStatsTopBudget'),

  // Import Excel
  importerExcel: () => ipcRenderer.invoke('db:importerExcel'),

  // Impression
  print: () => ipcRenderer.invoke('print:preview'),
  printToPdf: () => ipcRenderer.invoke('print:pdf'),

  // Mises à jour
  onUpdateAvailable: (cb: (info: { version: string; url: string }) => void) => {
    ipcRenderer.on('update:available', (_, info) => cb(info));
  },
  openUrl: (url: string) => ipcRenderer.invoke('update:openUrl', url),
});
