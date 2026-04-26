import React from 'react';
import { CheckCircle2, Plus, Undo2, ShoppingCart, Target, Trophy } from 'lucide-react';
import * as api from '../../../api/tasksApi';

interface TasksDashboardProps {
  tasks: api.Task[];
  rewards: api.Reward[];
  goals: api.Goal[];
  onComplete: (id: number) => void;
  onClaim: (id: number) => void;
  onShowModal: () => void;
}

export const TasksDashboard: React.FC<TasksDashboardProps> = ({
  tasks,
  rewards,
  goals,
  onComplete,
  onClaim,
  onShowModal
}) => {
  return (
    <>
      {/* Tasks List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" /> Dzisiejsze Cele
          </h3>
          <button 
            onClick={onShowModal}
            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Nowe Zadanie
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic">Wszystkie zadania wykonane! Odpocznij.</div>
          ) : tasks.map(task => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onComplete(task.id)}
                  className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-green-500 transition-all flex items-center justify-center text-transparent group-hover:text-green-500"
                >
                  <CheckCircle2 size={16} />
                </button>
                <div>
                  <p className="font-bold text-gray-700">{task.name}</p>
                  <p className="text-xs text-gray-400 uppercase font-medium">{task.type} • +{task.xp_reward} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-blue-500"><Undo2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
            <ShoppingCart size={16} className="text-purple-500" /> Sklep Nagród
          </h3>
          <div className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-sm text-gray-700">{reward.name}</p>
                  <p className="text-xs text-amber-600 font-bold">{reward.price} 🪙</p>
                </div>
                <button 
                  onClick={() => onClaim(reward.id)}
                  disabled={reward.quantity_left <= 0}
                  className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:bg-gray-200 transition-colors"
                >
                  Odbierz
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Target size={16} className="text-red-500" /> Kamienie Milowe
          </h3>
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-700">Cel: {goal.length} dni</p>
                  <p className="text-xs text-gray-400">Nagroda: {goal.reward} 🪙</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
