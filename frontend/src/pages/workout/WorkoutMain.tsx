import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api/workoutApi';
import { 
  Dumbbell, Play, Plus, ChevronRight,Info, Video
} from 'lucide-react';
import { AddWorkoutModal } from './AddWorkout.tsx';
import { AddExerciseModal } from './AddExercise.tsx';
import { LiveSessionView } from './LiveSession.tsx';

export const WorkoutMain: React.FC = () => {
  const [view, setView] = useState<'templates' | 'exercises' | 'live' | 'stats'>('templates');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [exercises, setExercises] = useState<api.Exercise[]>([]);
  const [workouts, setWorkouts] = useState<api.WorkoutTemplate[]>([]);
  const [activeSession, setActiveSession] = useState<api.SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Timer state for Live view
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [ex, wrk] = await Promise.all([api.fetchExercises(), api.fetchWorkouts()]);
      setExercises(ex);
      setWorkouts(wrk);
    } catch (e) { console.error("Error loading workout data", e); }
    finally { setIsLoading(false); }
  };

  const handleStartWorkout = async (id: number) => {
    try {
      const session = await api.startSession(id);
      setActiveSession(session);
      setView('live');
      startTimer();
    } catch (e) { alert("Nie udało się rozpocząć treningu."); }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setSeconds(prev => prev + 1), 1000);
  };

  const stopTimer = () => { if (timerRef.current) window.clearInterval(timerRef.current); };

  const handleNext = async (performance: number) => {
    if (!activeSession) return;
    const updated = await api.nextStep(activeSession.session_id, performance);
    if (updated.status === 'finished') {
      await api.finishSession(activeSession.session_id);
      setActiveSession(null);
      setView('templates');
      stopTimer();
      alert("Trening ukończony! Dobra robota!");
    } else {
      setActiveSession(updated);
    }
  };

  const handleAdjust = async (val: number) => {
    if (!activeSession) return;
    const updated = await api.adjustSession(activeSession.session_id, val);
    setActiveSession(updated);
  };

  const handleCreateExercise = async (data: Partial<api.Exercise>) => {
    await api.createExercise(data);
    setIsAddingExercise(false);
    loadInitialData();
  };

  const handleCreateWorkout = async (data: any) => {
    await api.createWorkout(data);
    setIsAddingWorkout(false);
    loadInitialData();
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <Dumbbell size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">LifeOS Workout</h1>
        </div>
        
        <nav className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'templates' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Plany
          </button>
          <button 
            onClick={() => setView('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'exercises' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ćwiczenia
          </button>
          <button 
            onClick={() => setView('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'stats' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Statystyki
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {view === 'templates' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Twoje Plany Treningowe</h2>
              <button 
                onClick={() => setIsAddingWorkout(true)}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus size={18} /> Nowy Plan
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map(w => (
                <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{w.name}</h3>
                      <p className="text-sm text-gray-500">{w.steps.length} kroków • ok. 45 min</p>
                    </div>
                    <button 
                      onClick={() => handleStartWorkout(w.id)}
                      className="bg-orange-100 text-orange-600 p-3 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {w.steps.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight size={14} className="text-orange-400" />
                        <span>{s.exercise?.name || "Ćwiczenie"}</span>
                        <span className="text-gray-400 ml-auto">{s.goal_value} {s.goal_type === 'reps' ? 'powt.' : 'sek.'}</span>
                      </div>
                    ))}
                    {w.steps.length > 3 && <p className="text-xs text-gray-400 ml-6">... i {w.steps.length - 3} więcej</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'exercises' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Katalog Ćwiczeń</h2>
              <button 
                onClick={() => setIsAddingExercise(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                + Dodaj do bazy
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {exercises.map(ex => (
                <div key={ex.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 transition-colors">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 relative">
                    {ex.media_url ? (
                       <img src={ex.media_url} alt={ex.name} className="w-full h-full object-cover" />
                    ) : (
                      <Video size={32} opacity={0.3} />
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white cursor-pointer hover:bg-black/70">
                       <Info size={14} />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-gray-800 truncate">{ex.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ex.description || "Brak opisu."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'live' && activeSession && (
          <LiveSessionView 
            session={activeSession} 
            onNext={handleNext} 
            onAdjust={handleAdjust}
            onCancel={() => { setActiveSession(null); setView('templates'); stopTimer(); }}
            totalSeconds={seconds}
          />
        )}
      </main>

      {/* Modals */}
      {isAddingExercise && (
        <AddExerciseModal onClose={() => setIsAddingExercise(false)} onSave={handleCreateExercise} />
      )}
      {isAddingWorkout && (
        <AddWorkoutModal exercises={exercises} onClose={() => setIsAddingWorkout(false)} onSave={handleCreateWorkout} />
      )}
    </div>
  );
};
