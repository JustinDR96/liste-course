import React, { useState } from 'react';
import { toast } from 'sonner';
import { Search, Database, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

type DBFound = { path: string; date: string; size: number };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Recuperation() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<DBFound[] | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);

  async function lancerScan() {
    setScanning(true);
    setResults(null);
    setRestored(null);
    const found = await window.api.scannerDB();
    setResults(found);
    setScanning(false);
  }

  async function restaurer(filePath: string) {
    setRestoring(filePath);
    const res = await window.api.restaurerDB(filePath);
    if (res.success) {
      setRestored(filePath);
      toast.success('Données restaurées ! Redémarrage dans 3 secondes...');
      setTimeout(() => window.api.redemarrer(), 3000);
    } else {
      toast.error(`Erreur : ${res.error}`);
      setRestoring(null);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Récupération des données</h1>
        <p className="text-sm text-gray-500">
          Recherche une ancienne base de données sur ton PC et la restaure.
        </p>
      </div>

      <button
        onClick={lancerScan}
        disabled={scanning}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Search size={16} />
        {scanning ? 'Scan en cours...' : 'Lancer le scan'}
      </button>

      {scanning && (
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Recherche sur le disque, cela peut prendre quelques instants...
        </div>
      )}

      {results !== null && !scanning && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Aucune base de données trouvée</p>
                <p className="text-orange-600 mt-0.5">
                  L'ancienne base de données a peut-être été supprimée, ou l'app avait été lancée directement depuis un ZIP sans extraction.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                {results.length} base{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''} :
              </p>
              <div className="flex flex-col gap-3">
                {results.map((db) => (
                  <div
                    key={db.path}
                    className={`flex items-center gap-4 p-4 bg-white border rounded-xl ${restored === db.path ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                  >
                    <Database size={20} className={`shrink-0 ${restored === db.path ? 'text-green-500' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate" title={db.path}>
                        {db.path}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Modifiée le {formatDate(db.date)} · {formatSize(db.size)}
                      </p>
                    </div>
                    {restored === db.path ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium shrink-0">
                        <CheckCircle size={15} />
                        Restaurée
                      </div>
                    ) : (
                      <button
                        onClick={() => restaurer(db.path)}
                        disabled={!!restoring}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-medium rounded-lg shrink-0 transition-colors"
                      >
                        <RotateCcw size={13} />
                        {restoring === db.path ? 'Restauration...' : 'Restaurer'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {restored && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                  Redémarrage en cours...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
