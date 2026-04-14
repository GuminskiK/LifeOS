import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api/workoutApi';
import { 
  Dumbbell, Play, Plus, Timer, History, Save, 
  ChevronRight, SkipForward, Pause, PlayCircle, 
  PlusCircle, MinusCircle, CheckCircle2, Info, Video, X, Trash2
} from 'lucide-react';

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

// --- SUBCOMPONENT: LIVE SESSION ---

interface LiveProps {
  session: api.SessionState;
  onNext: (val: number) => void;
  onAdjust: (val: number) => void;
  onCancel: () => void;
  totalSeconds: number;
}

const LiveSessionView: React.FC<LiveProps> = ({ session, onNext, onAdjust, onCancel, totalSeconds }) => {
  const currentStep = session.steps[session.current_step_index];
  const [performance, setPerformance] = useState(currentStep.goal_value);
  const isRest = currentStep.type === 'rest';

  // Reset local performance when step changes
  useEffect(() => {
    setPerformance(currentStep.goal_value);
  }, [session.current_step_index]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-white">
      {/* Top Bar */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div>
          <p className="text-orange-500 font-bold uppercase tracking-wider text-xs">Sesja Live</p>
          <h2 className="text-xl font-bold">{session.workout_name}</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase">Czas całkowity</p>
            <p className="text-2xl font-mono font-bold text-orange-400">{formatTime(totalSeconds)}</p>
          </div>
          <button onClick={onCancel} className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700">
            Wróć
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        
        {/* Progress Dots */}
        <div className="flex gap-1.5 mb-12">
          {session.steps.map((_, idx: number) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${idx === session.current_step_index ? 'w-8 bg-orange-500' : idx < session.current_step_index ? 'w-3 bg-green-500' : 'w-3 bg-slate-700'}`} 
            />
          ))}
        </div>

        <div className="text-center mb-4">
          <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${isRest ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
            {isRest ? 'Przerwa' : 'Ćwiczenie'}
          </span>
        </div>

        <h3 className="text-4xl md:text-5xl font-black mb-8 text-center">
          {isRest ? "ODPOCZYNEK" : (currentStep.exercise?.name || "Przygotuj się")}
        </h3>

        {/* Main Display (Counter) */}
        <div className="relative flex items-center justify-center mb-12">
          <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center shadow-2xl ${isRest ? 'border-blue-500/30' : 'border-orange-500/30'}`}>
             <span className="text-7xl font-black mb-1">{performance}</span>
             <span className="text-slate-400 font-bold uppercase tracking-widest">{currentStep.goal_type === 'reps' ? 'Powtórzeń' : 'Sekund'}</span>
          </div>
          
          {/* Adjust Buttons */}
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-4">
             <button 
              onClick={() => onAdjust(5)}
              className="p-4 bg-slate-800 rounded-full hover:bg-slate-700 text-orange-500 shadow-lg active:scale-90 transition-all"
             >
               <PlusCircle size={32} />
             </button>
             <button 
              onClick={() => onAdjust(-5)}
              className="p-4 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 shadow-lg active:scale-90 transition-all"
             >
               <MinusCircle size={32} />
             </button>
          </div>
        </div>

        {/* Manual Performance Input (if needed) */}
        <div className="w-full bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 font-medium">Twój wynik:</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setPerformance((p: number) => Math.max(0, p - 1))} className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">-</button>
                <input 
                  type="number" 
                  value={performance} 
                  onChange={(e) => setPerformance(parseInt(e.target.value) || 0)}
                  className="w-20 bg-transparent text-center text-2xl font-bold focus:outline-none"
                />
                <button onClick={() => setPerformance((p: number) => p + 1)} className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">+</button>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic text-center">
              Cel był ustawiony na {currentStep.goal_value}. {performance > currentStep.goal_value ? "Świetnie, progresujesz!" : ""}
            </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full">
          <button 
            className="flex-1 py-5 rounded-2xl bg-slate-800 font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Pause size={20} /> Pauza
          </button>
          <button 
            onClick={() => onNext(performance)}
            className="flex-[2] py-5 rounded-2xl bg-orange-600 font-black text-xl hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-95"
          >
            {session.current_step_index === session.steps.length - 1 ? (
              <><CheckCircle2 size={24} /> Zakończ trening</>
            ) : (
              <><SkipForward size={24} /> Następny krok</>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      {currentStep.exercise?.description && (
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center gap-4">
          <Info className="text-orange-500 shrink-0" size={20} />
          <p className="text-sm text-slate-400 italic">
            {currentStep.exercise?.description}
          </p>
        </div>
      )}
    </div>
  );
};

// --- MODAL: ADD EXERCISE ---

const AddExerciseModal: React.FC<{ onClose: () => void, onSave: (d: any) => void }> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', media_url: '' });

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Nowe ćwiczenie</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa</label>
            <input autoFocus className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Obrazu/Wideo</label>
            <input className="w-full border rounded-lg px-3 py-2" placeholder="https://..." value={form.media_url} onChange={e => setForm({...form, media_url: e.target.value})} />
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg font-medium">Anuluj</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Zapisz</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: ADD WORKOUT ---

const AddWorkoutModal: React.FC<{ exercises: api.Exercise[], onClose: () => void, onSave: (d: any) => void }> = ({ exercises, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<any[]>([]);

  const addStep = (exId: number) => {
    const ex = exercises.find(e => e.id === exId);
    setSteps([...steps, { exercise_id: exId, exercise: ex, type: 'exercise', goal_type: 'reps', goal_value: 10, order_index: steps.length }]);
  };

  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-gray-900">Stwórz Plan Treningowy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nazwa Planu</label>
            <input 
              placeholder="np. Klatka i Triceps" 
              className="text-xl font-bold w-full border-b-2 border-gray-200 focus:border-orange-500 outline-none pb-2"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Kroki treningu</label>
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-sm font-bold text-gray-400">{idx + 1}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{step.exercise?.name}</p>
                  <div className="flex gap-2 mt-1">
                    <select 
                      className="text-xs border rounded p-1 bg-white"
                      value={step.goal_type}
                      onChange={e => {
                        const newSteps = [...steps];
                        newSteps[idx].goal_type = e.target.value;
                        setSteps(newSteps);
                      }}
                    >
                      <option value="reps">Powtórzenia</option>
                      <option value="time">Czas (sek)</option>
                    </select>
                    <input 
                      type="number" 
                      className="text-xs border rounded p-1 w-16 bg-white"
                      value={step.goal_value}
                      onChange={e => {
                        const newSteps = [...steps];
                        newSteps[idx].goal_value = parseInt(e.target.value);
                        setSteps(newSteps);
                      }}
                    />
                  </div>
                </div>
                <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
              </div>
            ))}

            {steps.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed rounded-2xl text-gray-400">
                Wybierz ćwiczenia z listy poniżej, aby dodać je do planu
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Dostępne ćwiczenia</p>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addStep(ex.id)}
                  className="text-left px-3 py-2 border rounded-lg hover:bg-orange-50 hover:border-orange-200 text-sm flex justify-between group"
                >
                  {ex.name} <Plus size={14} className="text-orange-400 group-hover:text-orange-600"/>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg font-medium">Anuluj</button>
          <button 
            onClick={() => onSave({ name, steps: steps.map((s, i) => ({ ...s, order_index: i })) })} 
            disabled={!name || steps.length === 0}
            className="flex-[2] px-4 py-2 bg-orange-600 text-white rounded-lg font-bold disabled:opacity-50"
          >
            Zapisz Plan
          </button>
        </div>
      </div>
    </div>
  );
};