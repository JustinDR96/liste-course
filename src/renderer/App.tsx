import React from 'react';
import { HashRouter, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LayoutGrid } from 'lucide-react';
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

export default function App() {
  return (
    <HashRouter>
      <DialogProvider>
        <Layout />
      </DialogProvider>
    </HashRouter>
  );
}
