import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import path from 'node:path';
import https from 'node:https';
import started from 'electron-squirrel-startup';
import {
  initDatabase,
  getRayons, createRayon, updateRayon, updateRayonNom, deleteRayon, countProduitsInRayon, getProduitsParRayon,
  getProduits, createProduit, updateProduit, deleteProduit,
  getListeCourses, ajouterAListe, cocherProduit, updateQuantite, updatePrixListe, supprimerDeListe, viderListe,
  sauvegarderListe, getListesSauvegardees, getListeSauvegardeeItems, supprimerListeSauvegardee, chargerListeSauvegardee,
  getStatsBudgetMensuel, getStatsProduitsFréquents, getStatsGlobal, getStatsRayons, getStatsTopBudget,
  importerExcel,
} from './database';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// ─── Architecture "Zéro Trace" ────────────────────────────────────────────────
// Stocke les données à côté du .exe au lieu de AppData
const exeDir = path.dirname(app.getPath('exe'));
const dataDir = app.isPackaged
  ? path.join(exeDir, 'donnees_application')
  : path.join(app.getAppPath(), 'donnees_application_dev');

app.setPath('userData', dataDir);

// ─── Handlers IPC (communication Main <-> Renderer) ───────────────────────────
ipcMain.handle('db:getRayons', () => getRayons());
ipcMain.handle('db:createRayon', (_, nom: string, ordre: number) => createRayon(nom, ordre));
ipcMain.handle('db:updateRayon', (_, id: number, nom: string) => updateRayon(id, nom));
ipcMain.handle('db:updateRayonNom', (_, id: number, nom: string) => updateRayonNom(id, nom));
ipcMain.handle('db:deleteRayon', (_, id: number) => deleteRayon(id));
ipcMain.handle('db:countProduitsInRayon', (_, id: number) => countProduitsInRayon(id));
ipcMain.handle('db:getProduitsParRayon', (_, rayon_id: number) => getProduitsParRayon(rayon_id));

ipcMain.handle('db:getProduits', () => getProduits());
ipcMain.handle('db:createProduit', (_, nom: string, prix: number, rayon_id: number | null) => createProduit(nom, prix, rayon_id));
ipcMain.handle('db:updateProduit', (_, id: number, nom: string, prix: number, rayon_id: number | null) => updateProduit(id, nom, prix, rayon_id));
ipcMain.handle('db:deleteProduit', (_, id: number) => deleteProduit(id));

ipcMain.handle('db:getListeCourses', () => getListeCourses());
ipcMain.handle('db:ajouterAListe', (_, produit_id: number, quantite: number) => ajouterAListe(produit_id, quantite));
ipcMain.handle('db:cocherProduit', (_, id: number, coche: boolean) => cocherProduit(id, coche));
ipcMain.handle('db:updateQuantite', (_, id: number, quantite: number) => updateQuantite(id, quantite));
ipcMain.handle('db:updatePrixListe', (_, id: number, prix: number) => updatePrixListe(id, prix));
ipcMain.handle('db:supprimerDeListe', (_, id: number) => supprimerDeListe(id));
ipcMain.handle('db:viderListe', () => viderListe());

ipcMain.handle('db:sauvegarderListe', (_, nom: string) => sauvegarderListe(nom));
ipcMain.handle('db:getListesSauvegardees', () => getListesSauvegardees());
ipcMain.handle('db:getListeSauvegardeeItems', (_, liste_id: number) => getListeSauvegardeeItems(liste_id));
ipcMain.handle('db:supprimerListeSauvegardee', (_, id: number) => supprimerListeSauvegardee(id));
ipcMain.handle('db:chargerListeSauvegardee', (_, id: number) => chargerListeSauvegardee(id));

ipcMain.handle('db:getStatsBudgetMensuel', () => getStatsBudgetMensuel());
ipcMain.handle('db:getStatsProduitsFréquents', () => getStatsProduitsFréquents());
ipcMain.handle('db:getStatsGlobal', () => getStatsGlobal());
ipcMain.handle('db:getStatsRayons', () => getStatsRayons());
ipcMain.handle('db:getStatsTopBudget', () => getStatsTopBudget());

ipcMain.handle('db:importerExcel', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Sélectionner le fichier Excel',
    filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }],
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return { canceled: true };
  const stats = await importerExcel(filePaths[0]);
  return { canceled: false, ...stats };
});

// ─── Vérificateur de mise à jour ──────────────────────────────────────────────
const GITHUB_REPO = 'JustinDR96/liste-course';
const CURRENT_VERSION = app.getVersion();

function fetchLatestRelease(): Promise<{ version: string; url: string } | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: { 'User-Agent': 'ListeDeCourses-App' },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const version = (json.tag_name as string ?? '').replace(/^v/, '');
          const url = json.html_url as string ?? '';
          resolve(version ? { version, url } : null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

async function checkForUpdates(win: BrowserWindow) {
  const release = await fetchLatestRelease();
  if (!release) return;
  if (compareVersions(release.version, CURRENT_VERSION) > 0) {
    win.webContents.send('update:available', { version: release.version, url: release.url });
  }
}

ipcMain.handle('update:openUrl', (_, url: string) => {
  shell.openExternal(url);
});

Menu.setApplicationMenu(null);

const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Liste de Courses',
    icon: path.join(__dirname, '../../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Initialise la DB avant d'ouvrir la fenêtre
app.on('ready', async () => {
  await initDatabase(dataDir);
  const win = createWindow();
  // Vérifier les mises à jour 3 secondes après le démarrage
  setTimeout(() => checkForUpdates(win), 3000);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
