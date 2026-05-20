// eslint-disable-next-line @typescript-eslint/no-var-requires
const initSqlJs = require('sql.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XLSX = require('xlsx');
import type { Database } from 'sql.js';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

let db: Database;
let dbPath: string;

export async function initDatabase(dataDir: string): Promise<void> {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbPath = path.join(dataDir, 'liste_courses.db');

  const SQL = await initSqlJs.default({
    locateFile: (file: string) => {
      if (app.isPackaged) {
        return path.join(process.resourcesPath, file);
      }
      return path.join(__dirname, '../../node_modules/sql.js/dist/', file);
    }
  });

  // Charger la DB existante ou en créer une nouvelle
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  createTables();
  runMigrations();
  save();
}

function save(): void {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function createTables(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS rayons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE,
      numero_ordre INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prix REAL DEFAULT 0.0,
      rayon_id INTEGER,
      FOREIGN KEY (rayon_id) REFERENCES rayons(id)
    );

    CREATE TABLE IF NOT EXISTS liste_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL,
      quantite INTEGER DEFAULT 1,
      coche INTEGER DEFAULT 0,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    CREATE TABLE IF NOT EXISTS listes_sauvegardees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      date_creation TEXT NOT NULL,
      total REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS listes_sauvegardees_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      liste_id INTEGER NOT NULL,
      produit_nom TEXT NOT NULL,
      quantite INTEGER DEFAULT 1,
      prix REAL DEFAULT 0.0,
      rayon_nom TEXT,
      FOREIGN KEY (liste_id) REFERENCES listes_sauvegardees(id)
    );
  `);
}

function runMigrations(): void {
  try { db.run('ALTER TABLE rayons ADD COLUMN label TEXT'); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function all(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql: string, params: unknown[] = []): number {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  save();
  return result[0]?.values[0][0] as number ?? 0;
}

// ─── Rayons ───────────────────────────────────────────────────────────────────

export function getRayons() {
  return all('SELECT * FROM rayons ORDER BY numero_ordre ASC');
}

export function createRayon(nom: string, numero_ordre = 0): number {
  return run('INSERT INTO rayons (nom, numero_ordre) VALUES (?, ?)', [nom, numero_ordre]);
}

export function updateRayon(id: number, label: string): void {
  db.run('UPDATE rayons SET label = ? WHERE id = ?', [label, id]);
  save();
}

export function deleteRayon(id: number): void {
  // Délier les produits du rayon avant de le supprimer
  db.run('UPDATE produits SET rayon_id = NULL WHERE rayon_id = ?', [id]);
  db.run('DELETE FROM rayons WHERE id = ?', [id]);
  save();
}

export function countProduitsInRayon(id: number): number {
  const result = db.exec('SELECT COUNT(*) FROM produits WHERE rayon_id = ?', [id]);
  return result[0]?.values[0][0] as number ?? 0;
}

export function getProduitsParRayon(rayon_id: number) {
  return all('SELECT * FROM produits WHERE rayon_id = ? ORDER BY nom ASC', [rayon_id]);
}

// ─── Produits ─────────────────────────────────────────────────────────────────

export function getProduits() {
  return all(`
    SELECT p.*, r.nom AS rayon_nom, r.numero_ordre
    FROM produits p
    LEFT JOIN rayons r ON p.rayon_id = r.id
    ORDER BY r.numero_ordre ASC, p.nom ASC
  `);
}

export function createProduit(nom: string, prix: number, rayon_id: number | null): number {
  return run('INSERT INTO produits (nom, prix, rayon_id) VALUES (?, ?, ?)', [nom, prix, rayon_id]);
}

export function updateProduit(id: number, nom: string, prix: number, rayon_id: number | null): void {
  db.run('UPDATE produits SET nom = ?, prix = ?, rayon_id = ? WHERE id = ?', [nom, prix, rayon_id, id]);
  save();
}

export function deleteProduit(id: number): void {
  db.run('DELETE FROM liste_courses WHERE produit_id = ?', [id]);
  db.run('DELETE FROM produits WHERE id = ?', [id]);
  save();
}

// ─── Liste de courses ─────────────────────────────────────────────────────────

export function getListeCourses() {
  return all(`
    SELECT lc.*, p.nom AS produit_nom, p.prix, r.nom AS rayon_nom, r.numero_ordre
    FROM liste_courses lc
    JOIN produits p ON lc.produit_id = p.id
    LEFT JOIN rayons r ON p.rayon_id = r.id
    ORDER BY r.numero_ordre ASC, p.nom ASC
  `);
}

export function ajouterAListe(produit_id: number, quantite = 1): number {
  return run('INSERT INTO liste_courses (produit_id, quantite) VALUES (?, ?)', [produit_id, quantite]);
}

export function updateQuantite(id: number, quantite: number): void {
  db.run('UPDATE liste_courses SET quantite = ? WHERE id = ?', [quantite, id]);
  save();
}

export function cocherProduit(id: number, coche: boolean): void {
  db.run('UPDATE liste_courses SET coche = ? WHERE id = ?', [coche ? 1 : 0, id]);
  save();
}

export function supprimerDeListe(id: number): void {
  db.run('DELETE FROM liste_courses WHERE id = ?', [id]);
  save();
}

export function viderListe(): void {
  db.run('DELETE FROM liste_courses');
  save();
}

// ─── Listes sauvegardées ──────────────────────────────────────────────────────

export function sauvegarderListe(nom: string): number {
  const items = getListeCourses();
  const total = items.reduce((sum, i) => sum + (i.prix as number) * (i.quantite as number), 0);
  const date = new Date().toISOString();
  const listeId = run(
    'INSERT INTO listes_sauvegardees (nom, date_creation, total) VALUES (?, ?, ?)',
    [nom, date, total]
  );
  for (const item of items) {
    db.run(
      'INSERT INTO listes_sauvegardees_items (liste_id, produit_nom, quantite, prix, rayon_nom) VALUES (?, ?, ?, ?, ?)',
      [listeId, item.produit_nom, item.quantite, item.prix, item.rayon_nom ?? null]
    );
  }
  save();
  return listeId;
}

export function getListesSauvegardees() {
  return all('SELECT * FROM listes_sauvegardees ORDER BY date_creation DESC');
}

export function getListeSauvegardeeItems(liste_id: number) {
  return all(
    'SELECT * FROM listes_sauvegardees_items WHERE liste_id = ? ORDER BY rayon_nom ASC, produit_nom ASC',
    [liste_id]
  );
}

export function supprimerListeSauvegardee(id: number): void {
  db.run('DELETE FROM listes_sauvegardees_items WHERE liste_id = ?', [id]);
  db.run('DELETE FROM listes_sauvegardees WHERE id = ?', [id]);
  save();
}

// ─── Import Excel ─────────────────────────────────────────────────────────────

export async function importerExcel(filePath: string): Promise<{ rayons: number; produits: number }> {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Détecter si la première ligne est un header
  const firstRow = rows[0] as string[];
  const hasHeader = typeof firstRow[0] === 'string' && isNaN(Number(firstRow[0]));
  const data = hasHeader ? rows.slice(1) : rows;

  // Collecter les codes de rayons uniques
  const rayonsCodes = [...new Set(data.map(r => String(r[0])))].sort();

  // Insérer les rayons manquants
  const rayonIds: Record<string, number> = {};
  for (let i = 0; i < rayonsCodes.length; i++) {
    const code = rayonsCodes[i];
    db.run('INSERT OR IGNORE INTO rayons (nom, numero_ordre) VALUES (?, ?)', [code, i]);
    const result = db.exec('SELECT id FROM rayons WHERE nom = ?', [code]);
    rayonIds[code] = result[0].values[0][0] as number;
  }

  // Insérer les produits
  let count = 0;
  for (const row of data) {
    const code = String(row[0] ?? '').trim();
    const nom = String(row[1] ?? '').trim();
    const prix = parseFloat(String(row[2])) || 0;
    if (!nom || !code) continue;
    const rayonId = rayonIds[code] ?? null;
    db.run('INSERT INTO produits (nom, prix, rayon_id) VALUES (?, ?, ?)', [nom, prix, rayonId]);
    count++;
  }

  save();
  return { rayons: rayonsCodes.length, produits: count };
}
