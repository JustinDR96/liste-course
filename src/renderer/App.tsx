import React, { useEffect, useState } from 'react';
import { HashRouter, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LayoutGrid, Download, X } from 'lucide-react';
import { DialogProvider } from './components/ui/dialog';
import ListeCourses from './pages/ListeCourses';
import Produits from './pages/Produits';
import Rayons from './pages/Rayons';
import ApercuImpression from './pages/ApercuImpression';

function Layout() {
  const location = useLocation();
  const isApercu = location.pathname === '/apercu';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation — masquée sur la page d'aperçu */}
      {!isApercu && (
        <nav className="bg-white border-b border-gray-200 px-6 print:hidden">
          <div className="max-w-3xl mx-auto flex gap-1">
            <NavLink
              to="/liste"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <ShoppingCart size={15} />
              Liste de courses
            </NavLink>
            <NavLink
              to="/produits"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Package size={15} />
              Catalogue
            </NavLink>
            <NavLink
              to="/rayons"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <LayoutGrid size={15} />
              Rayons
            </NavLink>
          </div>
        </nav>
      )}

      {/* Contenu */}
      <Routes>
        <Route path="/liste" element={<ListeCourses />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/rayons" element={<Rayons />} />
        <Route path="/apercu" element={<ApercuImpression />} />
        <Route path="*" element={<Navigate to="/liste" replace />} />
      </Routes>
    </div>
  );
}

function UpdateBanner({ version, url, onClose }: { version: string; url: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-blue-200 rounded-xl shadow-lg px-4 py-3 max-w-sm">
      <Download size={18} className="text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">Mise à jour disponible</p>
        <p className="text-xs text-gray-500">Version {version} est disponible</p>
      </div>
      <button
        onClick={() => window.api.openUrl(url)}
        className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg shrink-0"
      >
        Télécharger
      </button>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}

export default function App() {
  const [update, setUpdate] = useState<{ version: string; url: string } | null>(null);

  useEffect(() => {
    window.api.onUpdateAvailable((info) => setUpdate(info));
  }, []);

  return (
    <HashRouter>
      <DialogProvider>
        <Layout />
        {update && (
          <UpdateBanner
            version={update.version}
            url={update.url}
            onClose={() => setUpdate(null)}
          />
        )}
      </DialogProvider>
    </HashRouter>
  );
}
