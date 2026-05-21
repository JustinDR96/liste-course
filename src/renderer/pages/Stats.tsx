import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Euro, BarChart2, Repeat } from 'lucide-react';

interface StatGlobal {
  moyenne_par_liste: number;
  liste_min: number;
  liste_max: number;
  nb_listes_total: number;
  total_global: number;
}

interface BudgetMensuel {
  mois: string;
  budget_total: number;
  nb_listes: number;
}

interface ProduitFrequent {
  produit_nom: string;
  nb_apparitions: number;
  quantite_totale: number;
}

interface RayonDepense {
  rayon_nom: string;
  depense_totale: number;
}

interface TopBudget {
  produit_nom: string;
  cout_total: number;
  prix_moyen: number;
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#6366f1', '#818cf8'];

function formatMois(mois: string) {
  const [year, month] = mois.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function Stats() {
  const [global, setGlobal] = useState<StatGlobal | null>(null);
  const [budgetMensuel, setBudgetMensuel] = useState<BudgetMensuel[]>([]);
  const [produitsFrequents, setProduitsFrequents] = useState<ProduitFrequent[]>([]);
  const [rayons, setRayons] = useState<RayonDepense[]>([]);
  const [topBudget, setTopBudget] = useState<TopBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function charger() {
      const [g, bm, pf, r, tb] = await Promise.all([
        window.api.getStatsGlobal(),
        window.api.getStatsBudgetMensuel(),
        window.api.getStatsProduitsFréquents(),
        window.api.getStatsRayons(),
        window.api.getStatsTopBudget(),
      ]);
      setGlobal((g[0] as unknown as StatGlobal) ?? null);
      setBudgetMensuel((bm as unknown as BudgetMensuel[]).reverse());
      setProduitsFrequents(pf as unknown as ProduitFrequent[]);
      setRayons(r as unknown as RayonDepense[]);
      setTopBudget(tb as unknown as TopBudget[]);
      setLoading(false);
    }
    charger();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Chargement...</div>;
  }

  if (!global || global.nb_listes_total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <BarChart2 size={40} className="opacity-30" />
        <p className="text-sm">Aucune donnée — sauvegarde d'abord quelques listes.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Cartes globales */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Listes sauvegardées" value={String(global.nb_listes_total)} color="blue" />
          <StatCard icon={Euro} label="Total dépensé" value={`${global.total_global?.toFixed(2) ?? '0.00'} €`} color="green" />
          <StatCard icon={TrendingUp} label="Panier moyen" value={`${global.moyenne_par_liste?.toFixed(2) ?? '0.00'} €`} sub={`min ${global.liste_min?.toFixed(2)}€ · max ${global.liste_max?.toFixed(2)}€`} color="purple" />
          <StatCard icon={Repeat} label="Produits distincts" value={String(produitsFrequents.length)} color="orange" />
        </div>

        {/* Budget mensuel */}
        {budgetMensuel.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget mensuel</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetMensuel} barSize={32}>
                <XAxis dataKey="mois" tickFormatter={formatMois} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(2)} €`, 'Budget']}
                  labelFormatter={formatMois}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="budget_total" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Produits les plus achetés */}
          {produitsFrequents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Produits les plus achetés</h2>
              <div className="space-y-2">
                {produitsFrequents.map((p, i) => (
                  <div key={p.produit_nom} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-medium text-gray-700 truncate">{p.produit_nom}</span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{p.nb_apparitions}×</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${(p.nb_apparitions / produitsFrequents[0].nb_apparitions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top dépenses par rayon */}
          {rayons.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Dépenses par rayon</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rayons} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                  <YAxis type="category" dataKey="rayon_nom" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`, 'Dépense']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="depense_totale" radius={[0, 4, 4, 0]}>
                    {rayons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top produits par coût total */}
        {topBudget.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Top produits par budget engagé</h2>
            <div className="divide-y divide-gray-100">
              {topBudget.map((p, i) => (
                <div key={p.produit_nom} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-300 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-700">{p.produit_nom}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-xs text-gray-400">{p.prix_moyen?.toFixed(2)} € / unité</span>
                    <span className="text-sm font-semibold text-gray-800 w-20">{p.cout_total?.toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
