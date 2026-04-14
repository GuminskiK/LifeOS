import React, { useEffect, useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { 
  Coins, Flame, Trophy, CheckCircle2, ShoppingCart, 
  Target, LayoutGrid, Loader2, Plus, MoreVertical, 
  TrendingUp, Award, Undo2, Calendar, ChevronLeft, 
  ChevronRight, X, Info
} from 'lucide-react';
import * as api from '../../api/tasksApi';

export const TasksMain: React.FC = () => {
  const [tasks, setTasks] = useState<api.Task[]>([]);
  const [vault, setVault] = useState<api.Vault | null>(null);
  const [goals, setGoals] = useState<api.Goal[]>([]);
  const [rewards, setRewards] = useState<api.Reward[]>([]);
  const [streaks, setStreaks] = useState<api.Streak[]>([]);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'forecast'>('tasks');

  // Forecast Range State
  const [rangeDays, setRangeDays] = useState(7);
  const [startDate, setStartDate] = useState(new Date());

  // Form State
  const [newTask, setNewTask] = useState<Partial<api.Task>>({
    name: '',
    description: '',
    type: 'task',
    start_date: '',
    end_date: '',
    priority: 1,
    recurrence: '',
    xp_reward: 10,
    currency_reward: 5,
    category_id: undefined,
    parent_id: undefined
  });

  // Helper to get Monday of the week
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper to get range for API and Rendering
  const getCalendarRange = () => {
    if (rangeDays === 30) {
      // Full Month mode
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      return { start, end };
    } else {
      // Week(s) mode - always start from Monday
      const start = getMonday(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + rangeDays - 1);
      return { start, end };
    }
  };

  const fetchData = async () => {
    try {
      const { start, end } = getCalendarRange();
      
      const [t, v, g, r, s, c, f] = await Promise.all([
        api.fetchTasks(),
        api.getVault(),
        api.fetchGoals(),
        api.fetchRewards(),
        api.fetchStreaks(),
        api.fetchCategories(),
        api.fetchTaskForecast(start.toISOString(), end.toISOString())
      ]);
      setTasks(t.filter(task => !task.is_archived));
      setVault(v);
      setGoals(g);
      setRewards(r);
      setStreaks(s);
      setCategories(c);
      setForecast(f);
    } catch (error) {
      console.error("Error fetching tasks data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, rangeDays]); // Refetch when date or mode changes

  const navigate = (direction: number) => {
    const newDate = new Date(startDate);
    if (rangeDays === 30) {
      newDate.setMonth(startDate.getMonth() + direction);
    } else {
      newDate.setDate(startDate.getDate() + (direction * rangeDays));
    }
    setStartDate(newDate);
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  };

  const weekDays = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];

  const handleComplete = async (id: number) => {
    await api.completeTask(id);
    fetchData();
  };

  const handleClaim = async (id: number) => {
    try {
      await api.claimReward(id);
      fetchData();
    } catch (e) {
      alert("Brak środków!");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name) return;
    
    // Clean up empty strings and undefined values before sending
    const payload = { ...newTask };
    if (!payload.description) delete payload.description;
    if (!payload.start_date) delete payload.start_date;
    if (!payload.end_date) delete payload.end_date;
    if (!payload.recurrence) delete payload.recurrence;
    if (!payload.category_id || isNaN(payload.category_id)) delete payload.category_id;
    if (!payload.parent_id || isNaN(payload.parent_id)) delete payload.parent_id;

    await api.createTask(payload);
    setNewTask({ 
      name: '', 
      description: '',
      type: 'task', 
      start_date: '',
      end_date: '',
      priority: 1,
      recurrence: '',
      xp_reward: 10, 
      currency_reward: 5,
      category_id: undefined,
      parent_id: undefined
    });
    setShowModal(false);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white rounded-xl border border-gray-200">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span className="font-medium">Synchronizacja Twojego życia...</span>
      </div>
    );
  }

  return (
    <Group orientation="horizontal" className="bg-white w-full h-full rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Sidebar: Statystyki i Serie */}
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

      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex flex-col justify-center items-center">
        <MoreVertical size={12} className="text-gray-400" />
      </Separator>

      {/* Main Content: Tasks & Shop */}
      <Panel defaultSize={75} minSize={30} className="flex flex-col min-w-0 bg-white">
        <div className="flex bg-gray-100 border-b border-gray-200 p-1 gap-1">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <LayoutGrid size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all ${activeTab === 'forecast' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Calendar size={16} /> Kalendarz i Prognoza
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'tasks' ? (
            <>
              {/* Tasks List */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" /> Dzisiejsze Cele
                  </h3>
                  <button 
                    onClick={() => setShowModal(true)}
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
                          onClick={() => handleComplete(task.id)}
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
                          onClick={() => handleClaim(reward.id)}
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
          ) : (
            /* Forecast View */
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {[7, 14, 30].map(d => (
                      <button 
                        key={d}
                        onClick={() => {
                          setRangeDays(d);
                          if (d === 30) setStartDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded ${rangeDays === d ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                      >
                        {d === 30 ? 'Miesiąc' : `${d} dni`}
                      </button>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 capitalize">
                    {rangeDays === 30 ? getMonthName(startDate) : `Tydzień od ${getMonday(startDate).toLocaleDateString()}`}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full border"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => navigate(1)}
                    className="p-2 hover:bg-gray-100 rounded-full border"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Weekday Headers */}
                {weekDays.map(day => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                    {day}
                  </div>
                ))}

                {/* Days Logic */}
                {(() => {
                  const { start, end } = getCalendarRange();
                  const days = [];
                  
                  // Add empty cells for month offset if needed
                  if (rangeDays === 30) {
                    const offset = (start.getDay() + 6) % 7; // Monday = 0
                    for (let i = 0; i < offset; i++) {
                      days.push(<div key={`empty-${i}`} className="bg-gray-50/50 min-h-[120px]" />);
                    }
                  }

                  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
                  for (let i = 0; i < totalDays; i++) {
                    const date = new Date(start);
                    date.setDate(start.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayTasks = forecast.filter(f => f.start_date.startsWith(dateStr));
                    const isToday = new Date().toDateString() === date.toDateString();

                    days.push(
                      <div key={dateStr} className={`bg-white p-2 min-h-[120px] transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                          <p className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                            {date.getDate()}
                          </p>
                          {isToday && <span className="px-2 py-0.5 bg-blue-600 text-[10px] text-white font-bold rounded">DZIŚ</span>}
                        </div>
                        <div className="space-y-2">
                          {dayTasks.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">Brak zadań</p>
                          ) : dayTasks.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs font-medium border border-gray-100">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'habit' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                              <span className="truncate">{t.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </section>
          )}
        </div>
      </Panel>

      {/* Modal Nowe Zadanie */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="text-blue-600" /> Nowe Zadanie
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto">
              
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
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]">
                  Dodaj do listy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Group>
  );
};