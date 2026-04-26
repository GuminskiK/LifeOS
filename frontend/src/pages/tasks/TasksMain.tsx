import React, { useEffect, useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Loader2, MoreVertical, LayoutGrid, Calendar } from 'lucide-react';
import * as api from '../../api/tasksApi';

import { TasksSidebar } from './components/TasksSidebar';
import { TasksDashboard } from './components/TasksDashboard';
import { TasksForecast } from './components/TasksForecast';
import { TaskModal } from './components/TaskModal';

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
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      return { start, end };
    } else {
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
  }, [startDate, rangeDays]);

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
    if (!payload.category_id || isNaN(payload.category_id as number)) delete payload.category_id;
    if (!payload.parent_id || isNaN(payload.parent_id as number)) delete payload.parent_id;

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
      <TasksSidebar vault={vault} streaks={streaks} categories={categories} />
      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex flex-col justify-center items-center">
        <MoreVertical size={12} className="text-gray-400" />
      </Separator>
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
            <TasksDashboard 
              tasks={tasks} 
              rewards={rewards} 
              goals={goals} 
              onComplete={handleComplete} 
              onClaim={handleClaim} 
              onShowModal={() => setShowModal(true)} 
            />
          ) : (
            <TasksForecast 
              startDate={startDate}
              setStartDate={setStartDate}
              rangeDays={rangeDays}
              setRangeDays={setRangeDays}
              forecast={forecast}
              navigate={navigate}
              getMonthName={getMonthName}
              getMonday={getMonday}
              getCalendarRange={getCalendarRange}
            />
          )}
        </div>
      </Panel>
      {showModal && (
        <TaskModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTask}
          newTask={newTask}
          setNewTask={setNewTask}
          categories={categories}
          tasks={tasks}
        />
      )}
    </Group>
  );
};
