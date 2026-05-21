import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { HashRouter, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LayoutGrid, Download, X, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { DialogProvider } from './components/ui/dialog';
import ListeCourses from './pages/ListeCourses';
import Produits from './pages/Produits';
import Rayons from './pages/Rayons';
import ApercuImpression from './pages/ApercuImpression';
import Stats from './pages/Stats';

const NAV_ITEMS = [
  { to: '/liste', icon: ShoppingCart, label: 'Liste de courses' },
  { to: '/produits', icon: Package, label: 'Catalogue' },
  { to: '/rayons', icon: LayoutGrid, label: 'Rayons' },
  { to: '/stats', icon: BarChart2, label: 'Statistiques' },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-200 print:hidden shrink-0 ${collapsed ? 'w-14' : 'w-52'}`}
    >
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 pt-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bouton collapse */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

function Layout() {
  const location = useLocation();
  const isApercu = location.pathname === '/apercu';
  const [collapsed, setCollapsed] = useState(false);

  if (isApercu) {
    return (
      <Routes>
        <Route path="/apercu" element={<ApercuImpression />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Routes>
          <Route path="/liste" element={<ListeCourses />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/rayons" element={<Rayons />} />
          <Route path="/apercu" element={<ApercuImpression />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/liste" replace />} />
        </Routes>
      </main>
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
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
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
