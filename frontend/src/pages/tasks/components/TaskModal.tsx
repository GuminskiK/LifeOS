import React from 'react';
import { Plus, X, Info } from 'lucide-react';
import * as api from '../../../api/tasksApi';

interface TaskModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTask: Partial<api.Task>;
  setNewTask: React.Dispatch<React.SetStateAction<Partial<api.Task>>>;
  categories: api.Category[];
  tasks: api.Task[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  onClose,
  onSubmit,
  newTask,
  setNewTask,
  categories,
  tasks
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="text-blue-600" /> Nowe Zadanie
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Główna sekcja */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Nazwa</label>
              <input 
                autoFocus
                value={newTask.name || ''}
                onChange={e => setNewTask({...newTask, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                placeholder="Co masz do zrobienia?"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Opis</label>
              <textarea 
                value={newTask.description || ''}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[80px]" 
                placeholder="Dodatkowe informacje..."
              />
            </div>
          </div>

          {/* Siatka 2-kolumnowa dla Typu, Kategorii, Priorytetu i Rodzica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Typ</label>
              <select 
                value={newTask.type}
                onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="task">Zwykłe zadanie (Task)</option>
                <option value="timed_task">Zadanie czasowe</option>
                <option value="habit">Nawyk</option>
                <option value="milestone">Kamień milowy</option>
                <option value="timed_milestone">Podkreślający kamień milowy</option>
                <option value="event">Wydarzenie</option>
                <option value="holiday">Święto / Urlop</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Kategoria</label>
              <select 
                value={newTask.category_id || ''}
                onChange={e => setNewTask({...newTask, category_id: parseInt(e.target.value) || undefined})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="">Wybierz...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Priorytet</label>
              <select 
                value={newTask.priority || 1}
                onChange={e => setNewTask({...newTask, priority: parseInt(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="1">1 - Najwyższy</option>
                <option value="2">2 - Wysoki</option>
                <option value="3">3 - Średni</option>
                <option value="4">4 - Niski</option>
                <option value="5">5 - Najniższy</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Zadanie Nadrzędne</label>
              <select 
                value={newTask.parent_id || ''}
                onChange={e => setNewTask({...newTask, parent_id: parseInt(e.target.value) || undefined})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium overflow-ellipsis"
              >
                <option value="">Brak (Główne zadanie)</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Sekcja dat dla zadań z terminem */}
          {['task', 'timed_task', 'milestone', 'timed_milestone', 'event'].includes(newTask.type || '') && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Od</label>
                <input 
                  type="datetime-local"
                  value={newTask.start_date || ''}
                  onChange={e => setNewTask({...newTask, start_date: e.target.value})}
                  className="w-full bg-white border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Do</label>
                <input 
                  type="datetime-local"
                  value={newTask.end_date || ''}
                  onChange={e => setNewTask({...newTask, end_date: e.target.value})}
                  className="w-full bg-white border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Sekcja nagród */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">XP</label>
              <input 
                type="number"
                value={newTask.xp_reward || 0}
                onChange={e => setNewTask({...newTask, xp_reward: parseInt(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
              />
            </div>
             <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 px-1">Monety</label>
              <input 
                type="number"
                value={newTask.currency_reward || 0}
                onChange={e => setNewTask({...newTask, currency_reward: parseInt(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 mt-4">
             <Info className="text-blue-500 shrink-0" size={20} />
             <p className="text-xs text-blue-700 font-medium">Ukończenie tego zadania doda Ci +{newTask.xp_reward || 0} XP i +{newTask.currency_reward || 0} Monet!</p>
          </div>

          <div className="pt-2 sticky bottom-0 bg-white border-t-0 shrink-0">
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]">
              Dodaj do listy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
