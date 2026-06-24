# Migration stockage DB → AppData

## Problème actuel

La base de données est stockée **à côté du `.exe`** dans `donnees_application/`.  
Si l'utilisateur extrait la mise à jour dans un nouveau dossier, les données restent dans l'ancien → perte de données.

## Solution : stocker dans AppData

`%APPDATA%\liste-course\liste_courses.db`

- Séparé de l'installation → jamais touché lors d'une mise à jour
- L'utilisateur ne peut pas l'effacer par accident
- Standard Windows

## Changements à faire

### 1. `src/main.ts` — changer `dataDir`

```ts
// Avant
const exeDir = path.dirname(app.getPath('exe'));
const dataDir = app.isPackaged
  ? path.join(exeDir, 'donnees_application')
  : path.join(app.getAppPath(), 'donnees_application_dev');

// Après
const dataDir = app.isPackaged
  ? path.join(app.getPath('appData'), 'liste-course')
  : path.join(app.getAppPath(), 'donnees_application_dev');
```

### 2. `src/main.ts` — migration automatique (à ajouter avant `initDatabase`)

Copie la DB depuis l'ancien emplacement si elle n'existe pas encore dans AppData.

```ts
const ancienDir = path.join(path.dirname(app.getPath('exe')), 'donnees_application');
const ancienneDb = path.join(ancienDir, 'liste_courses.db');
const nouvelleDb = path.join(dataDir, 'liste_courses.db');

if (fs.existsSync(ancienneDb) && !fs.existsSync(nouvelleDb)) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.copyFileSync(ancienneDb, nouvelleDb);
}
```

### 3. `database.ts` — rien à changer

La fonction `initDatabase(dataDir)` reçoit le chemin en paramètre, elle s'adapte automatiquement.

## Notes

- Supprimer le commentaire "Architecture Zéro Trace" dans `main.ts` qui ne s'applique plus
- Tester que la migration se déclenche bien sur un PC avec une ancienne version
- Bumper la version (ex: `1.1.0`) pour signaler le changement important
