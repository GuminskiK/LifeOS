import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api/workoutApi';

import { AddWorkoutModal } from './components/AddWorkout.tsx';
import { AddExerciseModal } from './components/AddExercise.tsx';
import { LiveSessionView } from './components/LiveSession.tsx';
import { Exercises } from './components/Exercises.tsx';
import { Templates } from './components/Templates.tsx';
import { Header, ViewType } from './components/Header.tsx';

export const WorkoutMain: React.FC = () => {
  const [view, setView] = useState<ViewType>('templates');
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
      <Header 
        view={view}
        setView={setView}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {view === 'templates' && (
          <Templates
            workouts={workouts}
            setIsAddingWorkout={setIsAddingWorkout}
            handleStartWorkout={handleStartWorkout}
          />
        )}

        {view === 'exercises' && (
          <Exercises 
            exercises={exercises}
            setIsAddingExercise={setIsAddingExercise}/>
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
