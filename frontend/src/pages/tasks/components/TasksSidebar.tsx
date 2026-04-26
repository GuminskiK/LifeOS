import React from 'react';
import { Panel } from 'react-resizable-panels';
import { Award, Coins, Flame, LayoutGrid, TrendingUp } from 'lucide-react';
import * as api from '../../../api/tasksApi';

interface TasksSidebarProps {
  vault: api.Vault | null;
  streaks: api.Streak[];
  categories: api.Category[];
}

export const TasksSidebar: React.FC<TasksSidebarProps> = ({ vault, streaks, categories }) => {
  return (
    <Panel defaultSize={250} minSize={250} maxSize={500} className="border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-blue-600" size={20} /> Profil LifeOS
        </h2>
        <div className="mt-4 space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Doświadczenie (XP)</p>
            <p className="text-2xl font-black text-blue-900">{vault?.xp_total.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Portfel</p>
              <p className="text-2xl font-black text-amber-900">{vault?.currency_total} 🪙</p>
            </div>
            <Coins className="text-amber-400" size={32} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Flame size={14} className="text-orange-500" /> Aktywne Serie
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {streaks.map(s => (
              <div key={s.id} className="bg-white p-2 rounded-lg border border-gray-200 text-center shadow-sm">
                <span className="block text-xl font-bold text-orange-600">🔥 {s.length}</span>
                <span className="text-[10px] text-gray-500 uppercase font-medium">{s.length_type}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <LayoutGrid size={14} /> Kategorie
          </h3>
          <div className="space-y-1">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-gray-600 transition-colors">
                <span>{cat.name}</span>
                <TrendingUp size={12} className="text-gray-300" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Panel>
  );
};
