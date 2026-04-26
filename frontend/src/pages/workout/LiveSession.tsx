import React, { useState, useEffect } from 'react';
import * as api from '../../api/workoutApi';
import { 
SkipForward, Pause, PlusCircle, MinusCircle, CheckCircle2, Info
} from 'lucide-react';

interface LiveProps {
  session: api.SessionState;
  onNext: (val: number) => void;
  onAdjust: (val: number) => void;
  onCancel: () => void;
  totalSeconds: number;
}

export const LiveSessionView: React.FC<LiveProps> = ({ session, onNext, onAdjust, onCancel, totalSeconds }) => {
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